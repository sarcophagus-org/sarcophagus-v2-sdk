import { BigNumber, ethers, UnsignedTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import axios, { AxiosResponse } from 'axios';

import { SarcophagusData, SarcophagusResponseContract, SarcophagusState } from './types/sarcophagi';
import { CallOptions, SarcoNetworkConfig } from './types';
import { RecoverPublicKeyErrorStatus, RecoverPublicKeyResponse } from './types/utils';
import { safeContractCall } from './helpers/safeContractCall';
import { getCurrentTimeSec } from './helpers/misc';
import { ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getSarcophagusState = (
  sarco: SarcophagusResponseContract | SarcophagusData,
  gracePeriod: number,
  timestampMs: number
): SarcophagusState => {
  if (sarco.resurrectionTime.eq(ethers.constants.Zero)) return SarcophagusState.DoesNotExist;
  if (sarco.resurrectionTime.eq(ethers.constants.MaxUint256)) return SarcophagusState.Buried;
  if (sarco.isCompromised) return SarcophagusState.Accused;

  const timestampSec = Math.trunc(timestampMs / 1000);

  const isPastGracePeriod = timestampSec >= sarco.resurrectionTime.toNumber() + gracePeriod;

  if (sarco.publishedPrivateKeyCount >= sarco.threshold)
    return sarco.isCleaned ? SarcophagusState.CleanedResurrected : SarcophagusState.Resurrected;

  const withinGracePeriod =
    timestampSec >= sarco.resurrectionTime.toNumber() && timestampSec < sarco.resurrectionTime.toNumber() + gracePeriod;

  if (withinGracePeriod) return SarcophagusState.Resurrecting;

  if (isPastGracePeriod) return sarco.isCleaned ? SarcophagusState.CleanedFailed : SarcophagusState.Failed;

  return SarcophagusState.Active;
};

export class Utils {
  private networkConfig: SarcoNetworkConfig;
  private signer: ethers.Signer;
  private viewStateFacet: ethers.Contract;

  constructor(networkConfig: SarcoNetworkConfig, signer: ethers.Signer) {
    this.networkConfig = networkConfig;
    this.signer = signer;
    this.viewStateFacet = new ethers.Contract(networkConfig.diamondDeployAddress, ViewStateFacet__factory.abi, signer);
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

      await wait(3000);

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

    const currentTimeMs = (await getCurrentTimeSec(this.signer.provider!)) * 1000;

    return getSarcophagusState(sarcoContract, gracePeriod.toNumber(), currentTimeMs);
  }
}
