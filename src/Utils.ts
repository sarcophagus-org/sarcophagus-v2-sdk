import { BigNumber, ethers, utils } from 'ethers';
import { UnsignedTransaction, computeAddress, formatEther } from 'ethers/lib/utils';
import moment from 'moment';
import { SarcophagusData, SarcophagusResponseContract, SarcophagusState } from './types/sarcophagi';
import { safeContractCall } from './helpers/safeContractCall';
import {
  CallOptions,
  ContractArchaeologist,
  SarcoNetworkConfig,
  SubmitSarcophagusArgsTuple,
  SubmitSarcophagusProps,
  SubmitSarcophagusSettings,
} from './types';
import { RecoverPublicKeyErrorStatus, RecoverPublicKeyResponse } from './types/utils';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import axios, { AxiosResponse } from 'axios';
import { ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { getLowestResurrectionTime, getLowestRewrapInterval } from './helpers';

export class Utils {
  private networkConfig: SarcoNetworkConfig;
  private signer: ethers.Signer;
  private viewStateFacet: ethers.Contract;

  constructor(networkConfig: SarcoNetworkConfig, signer: ethers.Signer) {
    this.viewStateFacet = new ethers.Contract(networkConfig.diamondDeployAddress, ViewStateFacet__factory.abi, signer);
    this.signer = signer;
    this.networkConfig = networkConfig;
  }

  public getLowestRewrapInterval = getLowestRewrapInterval;
  public getLowestResurrectionTime = getLowestResurrectionTime;

  formatSarco(valueInWei: string | number, precision: number = 2): string {
    const value = formatEther(valueInWei.toString());
    const numericValue: number = Number(value);
    if (isNaN(numericValue)) {
      return value.toString();
    }
    const formattedValue: string = numericValue.toFixed(precision).replace(/\.?0*$/, '');

    if (formattedValue === '0' && parseFloat(value) > 0) {
      return `< 0.${'0'.repeat(precision - 1)}1`;
    }

    return formattedValue;
  }

  /**
   * This function estimates sarco per month based on average number of days per month. This value is
   * only used to display to the user, never as an argument to the smart contracts.
   */
  convertSarcoPerSecondToPerMonth(diggingFeePerSecond: string): string {
    const averageNumberOfSecondsPerMonth = 2628288;
    return BigNumber.from(diggingFeePerSecond).mul(averageNumberOfSecondsPerMonth).toString();
  }

  async getBlockTimestamp(provider: ethers.providers.Provider): Promise<number> {
    try {
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);

      return block.timestamp;
    } catch (error) {
      // Not a good fallback, may want to institute a retry or failure (or notification)
      console.warn(`Error retrieving block time: ${error}`, true);
      return Math.trunc(Date.now() / 1000);
    }
  }

  async getDateFromTimestamp(timestamp: number) {
    new Date(timestamp * 1000);
  }

  /**
   * Builds a resurrection date string from a BigNumber
   * Ex: 09.22.2022 7:30pm (12 Days)
   * @param resurrectionTime
   * @returns The resurrection string
   */
  buildResurrectionDateString(
    resurrectionTime: BigNumber | undefined,
    timestampMs: number,
    options?: { format?: string; hideDuration?: boolean }
  ): string {
    const { format = 'MM.DD.YYYY h:mmA', hideDuration = false } = options || {};

    // In the case where sarcophagus resurrection time is not defined for whatever reason
    if (!resurrectionTime) {
      return '--';
    }

    // In the case where the sarcophagus is buried, the resurrection time will be set to the max
    // uint256 value. It's not possible to display this number as a date.
    if (resurrectionTime.toString() === ethers.constants.MaxUint256.toString()) {
      return '--';
    }

    const resurrectionDateString = moment.unix(resurrectionTime.toNumber()).format(format);
    const msUntilResurrection = resurrectionTime.toNumber() * 1000 - timestampMs;
    const humanizedDuration = moment.duration(msUntilResurrection).humanize();
    const timeUntilResurrection = msUntilResurrection < 0 ? `${humanizedDuration} ago` : humanizedDuration;
    return hideDuration ? resurrectionDateString : `${resurrectionDateString} (${timeUntilResurrection})`;
  }

  async getCurrentTimeSec(provider: ethers.providers.Provider | ethers.providers.Web3Provider) {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    return block.timestamp;
  }

  getSarcophagusState(
    sarco: SarcophagusResponseContract | SarcophagusData,
    gracePeriod: number,
    timestampMs: number
  ): SarcophagusState {
    if (sarco.resurrectionTime.eq(ethers.constants.Zero)) return SarcophagusState.DoesNotExist;
    if (sarco.resurrectionTime.eq(ethers.constants.MaxUint256)) return SarcophagusState.Buried;
    if (sarco.isCompromised) return SarcophagusState.Accused;

    const timestampSec = Math.trunc(timestampMs / 1000);

    const isPastGracePeriod = timestampSec >= sarco.resurrectionTime.toNumber() + gracePeriod;

    if (sarco.publishedPrivateKeyCount >= sarco.threshold)
      return sarco.isCleaned ? SarcophagusState.CleanedResurrected : SarcophagusState.Resurrected;

    const withinGracePeriod =
      timestampSec >= sarco.resurrectionTime.toNumber() &&
      timestampSec < sarco.resurrectionTime.toNumber() + gracePeriod;

    if (withinGracePeriod) return SarcophagusState.Resurrecting;

    if (isPastGracePeriod) return sarco.isCleaned ? SarcophagusState.CleanedFailed : SarcophagusState.Failed;

    return SarcophagusState.Active;
  }

  /**
   * returns a public key from a transaction
   *
   * transaction.type can be these values, results in UnsignedTransaction object
   * from EIP-2719 (https://eips.ethereum.org/EIPS/eip-2719)
   * defines legacy transaction
   *   0x00 or not set - rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
   *
   * from EIP-2930 (https://eips.ethereum.org/EIPS/eip-2930)
   *   0x01 - rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
   *
   * from EIP-1559 (https://eips.ethereum.org/EIPS/eip-1559)
   *   0x02 - rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s]).
   */
  private async getPublicKeyFromTransactionResponse(transaction: TransactionResponse) {
    function isLegacy(type: number | null | undefined): boolean {
      return type === 0 || !type;
    }

    function isEIP2930(type: number | null | undefined): boolean {
      return type === 1;
    }

    function isEIP1550(type: number | null | undefined): boolean {
      return type === 2;
    }

    const unsignedTransaction: UnsignedTransaction = {
      type: transaction.type,
      nonce: transaction.nonce,
      gasLimit: transaction.gasLimit,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,

      ...(transaction.chainId && { chainId: transaction.chainId }),

      ...((isLegacy(transaction.type) || isEIP2930(transaction.type)) && {
        gasPrice: transaction.gasPrice,
      }),

      ...((isEIP2930(transaction.type) || isEIP1550(transaction.type)) && {
        accessList: transaction.accessList,
      }),

      ...(isEIP1550(transaction.type) && {
        maxFeePerGas: transaction.maxFeePerGas,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      }),
    };

    const resolvedTx = await ethers.utils.resolveProperties(unsignedTransaction);
    const rawTx = ethers.utils.serializeTransaction(resolvedTx);
    const msgHash = ethers.utils.keccak256(rawTx);

    const signature = ethers.utils.splitSignature({
      r: transaction.r || '',
      s: transaction.s || '',
      v: transaction.v || 0,
    });

    return ethers.utils.recoverPublicKey(msgHash, signature);
  }

  private async recoverPublicKeyWithRetry(address: string, depth = 0): Promise<AxiosResponse> {
    const getParameters = 'module=account&action=txlist&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc';

    try {
      const response = await axios.get(
        `${this.networkConfig.etherscanApiUrl}?${getParameters}&address=${address}&apikey=${this.networkConfig.etherscanApiKey}`
      );

      if (response.status !== 200) {
        console.log('recoverPublicKey error:', response.data.message);
        throw response.data.message;
      }

      if (typeof response.data.result === 'string') {
        throw response.data.result;
      }

      return response;
    } catch (e) {
      console.log(`Recover attempt ${depth + 1} failed, retrying....`);
      if (depth > 0) {
        throw e;
      }

      await this.wait(3000);

      return this.recoverPublicKeyWithRetry(address, depth + 1);
    }
  }

  /**
   * Returns a public key from a given address
   * @param address address to recover public key from
   * @returns RecoverPublicKeyResponse
   **/
  async recoverPublicKey(address: string): Promise<RecoverPublicKeyResponse> {
    try {
      if (!ethers.utils.isAddress(address.toLowerCase())) {
        return { error: RecoverPublicKeyErrorStatus.INVALID_ADDRESS };
      }

      const response = await this.recoverPublicKeyWithRetry(address, 3);

      if (response.status !== 200) {
        console.log('recoverPublicKey error:', response.data.message);
        return { error: RecoverPublicKeyErrorStatus.ERROR, message: response.data.message };
      }

      for (let index = 0; index < response.data.result.length; index++) {
        const transaction = await this.signer.provider!.getTransaction(response.data.result[index].hash);

        //we can only resolve a public key when the 'from' transaction matches the given address
        if (transaction.from && transaction.from.toLowerCase() === address.toLowerCase()) {
          const recoveredPublicKey = await this.getPublicKeyFromTransactionResponse(transaction);
          if (ethers.utils.computeAddress(recoveredPublicKey).toLowerCase() == address.toLowerCase()) {
            return { publicKey: recoveredPublicKey };
          }
        }
      }

      return { error: RecoverPublicKeyErrorStatus.CANNOT_RECOVER };
    } catch (_error) {
      const error = _error as Error;
      console.log('recoverPublicKey error', error);
      return { error: RecoverPublicKeyErrorStatus.ERROR, message: error.message };
    }
  }

  /**
   * Gets the sarcophagus state from a given sarcophagus id
   * @param sarcoId sarcophagus id to get state from
   * @returns SarcophagusState
   */
  async getSarcophagusStateFromId(sarcoId: string, options: CallOptions = {}) {
    const sarcoContract = (await safeContractCall(
      this.viewStateFacet,
      'getSarcophagus',
      [sarcoId],
      options
    )) as unknown as SarcophagusResponseContract;

    const gracePeriod = (await safeContractCall(
      this.viewStateFacet,
      'getGracePeriod',
      [],
      options
    )) as unknown as BigNumber;

    const currentTimeMs = (await this.getCurrentTimeSec(this.signer.provider!)) * 1000;

    return this.getSarcophagusState(sarcoContract, gracePeriod.toNumber(), currentTimeMs);
  }

  generateKeyPair() {
    const wallet = ethers.Wallet.createRandom();
    const publicKey = wallet.publicKey;
    const privateKey = wallet.privateKey;

    return { publicKey, privateKey };
  }

  formatSubmitSarcophagusArgs({
    name,
    recipientState,
    resurrection,
    selectedArchaeologists,
    requiredArchaeologists,
    negotiationTimestamp,
    archaeologistPublicKeys,
    archaeologistSignatures,
    arweaveTxId,
  }: SubmitSarcophagusProps) {
    const getContractArchaeologists = (): ContractArchaeologist[] => {
      return selectedArchaeologists.map(arch => {
        const { v, r, s } = utils.splitSignature(archaeologistSignatures.get(arch.profile.archAddress)!);
        return {
          archAddress: arch.profile.archAddress as `0x${string}`,
          diggingFeePerSecond: arch.profile.minimumDiggingFeePerSecond,
          curseFee: arch.profile.curseFee,
          publicKey: archaeologistPublicKeys.get(arch.profile.archAddress)!,
          v,
          r,
          s,
        };
      });
    };

    const sarcoId = ethers.utils.id(name + Date.now().toString());
    const settings: SubmitSarcophagusSettings = {
      name,
      recipientAddress: recipientState.publicKey ? computeAddress(recipientState.publicKey) : '',
      resurrectionTime: Math.trunc(resurrection / 1000),
      threshold: requiredArchaeologists,
      creationTime: Math.trunc(negotiationTimestamp / 1000),
      maximumRewrapInterval: getLowestRewrapInterval(selectedArchaeologists),
      maximumResurrectionTime: getLowestResurrectionTime(selectedArchaeologists),
    };

    const contractArchaeologists = getContractArchaeologists();

    const submitSarcophagusArgs: SubmitSarcophagusArgsTuple = [
      sarcoId,
      {
        ...settings,
      },
      contractArchaeologists,
      arweaveTxId,
    ];

    return { submitSarcophagusArgs };
  }

  private wait(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}
