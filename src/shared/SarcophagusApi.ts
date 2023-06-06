import { EmbalmerFacet__factory, ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions, SarcoNetworkConfig } from './types';
import {
  ArchaeologistSettings,
  SarcophagusSettings,
  archaeologistSettingsArraySchema,
  sarcophagusSettingsSchema,
} from './helpers/validation';
import {
  getPrivateKeyPublishes,
  getSubgraphSarcoCounts,
  getSubgraphSarcophagi,
  getSubgraphSarcophagusWithRewraps,
} from './helpers/subgraph';
import {
  SarcoCounts,
  SarcophagusData,
  SarcophagusDetails,
  SarcophagusFilter,
  SarcophagusResponseContract,
} from './types/sarcophagi';
import { Utils } from './Utils';
import { ArweaveResponse, OnDownloadProgress } from './types/arweave';
import { fetchArweaveFile } from './helpers/arweaveUtil';
import { decrypt } from './helpers/encryption';
import { arrayify } from 'ethers/lib/utils';
import { combine } from 'shamirs-secret-sharing-ts';

export class SarcophagusApi {
  private embalmerFacet: ethers.Contract;
  private subgraphUrl: string;
  private viewStateFacet: ethers.Contract;
  private signer: ethers.Signer;
  private utils: Utils;
  private networkConfig: SarcoNetworkConfig;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, networkConfig: SarcoNetworkConfig) {
    this.embalmerFacet = new ethers.Contract(diamondDeployAddress, EmbalmerFacet__factory.abi, signer);
    this.viewStateFacet = new ethers.Contract(diamondDeployAddress, ViewStateFacet__factory.abi, signer);
    this.subgraphUrl = networkConfig.subgraphUrl;
    this.signer = signer;
    this.networkConfig = networkConfig;
    this.utils = new Utils();
  }

  /**
   * Creates a new sarcophagus.
   *
   * @param sarcoId - The ID of the sarcophagus to be created
   * @param sarcophagusSettings - The configuration settings for the sarcophagus
   * @param selectedArchaeologists - The archaeologists to be responsible for and cursed on the sarcophagus
   * @param arweaveTxId - The ID of the Arweave transaction containing the encrypted data
   * @param options - Options for the contract method call
   * @returns The transaction response
   * */
  async createSarcophagus(
    sarcoId: string,
    sarcophagusSettings: SarcophagusSettings,
    selectedArchaeologists: ArchaeologistSettings[],
    arweaveTxId: string,
    options: CallOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    sarcophagusSettings = await sarcophagusSettingsSchema.validate(sarcophagusSettings);
    selectedArchaeologists = await archaeologistSettingsArraySchema.validate(selectedArchaeologists);

    if (selectedArchaeologists.length < sarcophagusSettings.threshold) {
      throw new Error('Not enough archaeologists selected');
    }

    return safeContractCall(
      this.embalmerFacet,
      'createSarcophagus',
      [sarcoId, sarcophagusSettings, selectedArchaeologists, arweaveTxId],
      options
    );
  }

  /**
   * Resets the resurrection time of a sarcophagus to a further time in the future.
   *
   * @param sarcoId - The ID of the sarcophagus to be rewrapped
   * @param resurrectionTime - The new resurrection time
   * @param options - Options for the contract method call
   * @returns The transaction response
   * */
  async rewrapSarcophagus(
    sarcoId: string,
    resurrectionTime: number,
    options: CallOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    return safeContractCall(this.embalmerFacet, 'rewrapSarcophagus', [sarcoId, resurrectionTime], options);
  }

  /**
   * Invalidates the Sarcophagus by setting a MaxUint32 resurrection time. Once this is done,
   * the sarcophagus can never be resurrected. Cursed archaeologists are freed from their curse and
   * their locked bonds are returned to them.
   *
   * This can only be called by the sarcophagus owner.
   *
   * @param sarcoId - The ID of the sarcophagus to be buried
   * @param options - Options for the contract method call
   * @returns The transaction response
   * */
  async burySarcophagus(sarcoId: string, options: CallOptions = {}): Promise<ethers.providers.TransactionResponse> {
    return safeContractCall(this.embalmerFacet, 'burySarcophagus', [sarcoId], options);
  }

  /**
   * Cleans a sarcophagus that failed to be unwrapped. This can only be called by the sarcophagus owner
   * within a certain time period after the resurrection time has passed. Otherwise it can only be called
   * by the Sarcophagus DAO.
   *
   * @param sarcoId - The ID of the sarcophagus to be cleaned
   * @param options - Options for the contract method call
   * @returns The transaction response
   * */
  async cleanSarcophagus(sarcoId: string, options: CallOptions = {}): Promise<ethers.providers.TransactionResponse> {
    return safeContractCall(this.embalmerFacet, 'cleanSarcophagus', [sarcoId], options);
  }

  async getRewrapsOnSarcophagus(sarcoId: string) {
    const archData = await getSubgraphSarcophagusWithRewraps(this.subgraphUrl, sarcoId);
  }

  /**
   * Returns a list of sarcophagi for a given embalmer address.
   * @param address - The address to get sarcophagi for
   * @param options - Options for the contract method call
   * @returns The list of sarcophagi
   * */
  async getEmbalmerSarcophagi(address: string, options: CallOptions = {}): Promise<SarcophagusData[]> {
    return this.getSarcophagi(address, { ...options, filter: SarcophagusFilter.embalmer });
  }

  /**
   * Returns a list of sarcophagi for a given recipient address.
   * @param address - The address to get sarcophagi for
   * @param options - Options for the contract method call
   * @returns The list of sarcophagi
   * */
  async getRecipientSarcophagi(address: string, options: CallOptions = {}): Promise<SarcophagusData[]> {
    return this.getSarcophagi(address, { ...options, filter: SarcophagusFilter.recipient });
  }

  async claimSarcophagus(
    sarcoId: string,
    recipientPrivateKey: string,
    onDownloadProgress: OnDownloadProgress
  ): Promise<{
    fileName: string;
    data: string;
    error?: string;
  }> {
    try {
      const privateKeys = await getPrivateKeyPublishes(this.subgraphUrl, sarcoId);
      const sarcophagus = (await getSubgraphSarcophagi(this.subgraphUrl, [sarcoId]))[0];
      const canResurrect = privateKeys.length >= Number.parseInt(sarcophagus.threshold);

      if (!canResurrect) {
        throw new Error('Cannot resurrect -- not enough private keys');
      }

      const payloadTxId = sarcophagus.arweaveTxId;

      // In case the sarcophagus has no tx id. This should never happen but, just in case.
      if (!payloadTxId) {
        throw new Error(`The Arwevae tx id for the payload is missing on sarcophagus ${sarcoId}`);
      }

      // Load the payload from arweave using the txId
      const arweaveFile = await fetchArweaveFile(payloadTxId, this.networkConfig, onDownloadProgress);

      if (!arweaveFile) throw Error('Failed to download file from arweave');

      // Decrypt the key shares. Each share is double-encrypted with an inner layer of encryption
      // with the recipient's key, and an outer layer of encryption with the archaeologist's key.
      const decryptedKeyShares: Buffer[] = [];
      for await (const archAddress of sarcophagus.cursedArchaeologists) {
        const arch = (await safeContractCall(this.viewStateFacet, 'getSarcophagusArchaeologist', [
          sarcoId,
          archAddress,
        ])) as unknown as { publicKey: string; privateKey: string };

        // If arch failed to publish private key, continue to next key
        if (arch.privateKey === ethers.constants.HashZero) {
          continue;
        }

        const archDoubleEncryptedKeyShare = arweaveFile.keyShares[arch.publicKey];

        // Decrypt outer layer with arch private key
        const recipientEncryptedKeyShare = await decrypt(
          arch.privateKey,
          Buffer.from(arrayify(archDoubleEncryptedKeyShare))
        );

        // Decrypt inner layer with rceipient private key
        const decryptedKeyShare = await decrypt(recipientPrivateKey, recipientEncryptedKeyShare);

        decryptedKeyShares.push(decryptedKeyShare);
      }

      // Apply SSS with the decrypted shares to derive the payload file's decryption key
      const payloadDecryptionKey = combine(decryptedKeyShares).toString();

      // Decrypt the payload with the recombined key
      const decryptedPayload = await decrypt(payloadDecryptionKey, arweaveFile.fileBuffer);

      const decryptedfileName = await decrypt(
        recipientPrivateKey,
        Buffer.from(arweaveFile.metadata.fileName, 'binary')
      );
      const decryptedfileType = await decrypt(recipientPrivateKey, Buffer.from(arweaveFile.metadata.type, 'binary'));

      const decryptedResult = {
        fileName: decryptedfileName.toString('binary'),
        data: `${decryptedfileType.toString('binary')},${decryptedPayload.toString('base64')}`,
      };

      if (!decryptedResult.fileName || !decryptedResult.data) {
        console.error(`Missing fileName or data in decryptedResult: ${decryptedResult}`);
        throw new Error('The payload is missing the fileName or data');
      }

      return decryptedResult;
    } catch (error) {
      console.error(`Error resurrecting sarcophagus: ${error}`);
      throw new Error('Could not claim Sarcophagus. Please make sure you have the right private key.');
    }
  }

  /**
   * Returns detailed information about a sarcophagus.
   * @param options - Options for the contract method call
   * @returns The number of sarcophagi
   * */
  async getSarcophagusDetails(sarcoId: string, options: CallOptions = {}): Promise<SarcophagusDetails> {
    const subgraphSarco = await getSubgraphSarcophagusWithRewraps(this.subgraphUrl, sarcoId);
    const publishedKeys = await getPrivateKeyPublishes(this.subgraphUrl, sarcoId);

    const gracePeriod = (await safeContractCall(
      this.viewStateFacet,
      'getGracePeriod',
      [],
      options
    )) as unknown as BigNumber;

    const sarcoContract = (await safeContractCall(
      this.viewStateFacet,
      'getSarcophagus',
      [sarcoId],
      options
    )) as unknown as SarcophagusResponseContract;

    const currentTimeMs = (await this.utils.getCurrentTimeSec(this.signer.provider!)) * 1000;
    return {
      ...sarcoContract,
      state: this.utils.getSarcophagusState(sarcoContract, gracePeriod.toNumber(), currentTimeMs),
      id: sarcoId,
      rewraps: subgraphSarco.rewraps,
      publishedKeys,
    };
  }

  /**
   * Return the payload file from arweave for a given sarcophagus.
   * @param sarcoId - The ID of the sarcophagus to get the payload for
   * @param onDownloadProgress - Callback for download progress
   * @returns The arweave payload file
   * */
  async getSarcophagusPayload(sarcoId: string, onDownloadProgress: OnDownloadProgress): Promise<ArweaveResponse> {
    const sarcophagus = (await getSubgraphSarcophagi(this.subgraphUrl, [sarcoId]))[0];
    const payloadTxId = sarcophagus.arweaveTxId;
    const arweaveFile = await fetchArweaveFile(payloadTxId, this.networkConfig, onDownloadProgress);
    if (!arweaveFile) throw Error('Failed to download file from arweave');
    return arweaveFile;
  }

  /**
   * Returns the number of sarcophagi in the contract.
   * @param options - Options for the contract method call
   * @returns The number of sarcophagi
   * */
  async getSarcophagiCount(): Promise<SarcoCounts> {
    return getSubgraphSarcoCounts(this.subgraphUrl);
  }

  private async getSarcophagi(
    address: string,
    options: CallOptions & { filter: SarcophagusFilter }
  ): Promise<SarcophagusData[]> {
    let sarcoIds: string[] = [];
    let methodName: string;

    switch (options.filter) {
      case SarcophagusFilter.embalmer:
        methodName = 'getEmbalmerSarcophagi';
        break;

      case SarcophagusFilter.recipient:
        methodName = 'getRecipientSarcophagi';
        break;
    }

    sarcoIds = (await safeContractCall(this.viewStateFacet, methodName, [address], options)) as unknown as string[];

    const gracePeriod = (await safeContractCall(
      this.viewStateFacet,
      'getGracePeriod',
      [],
      options
    )) as unknown as BigNumber;

    const sarcophagi: SarcophagusData[] = await Promise.all(
      sarcoIds.map(async sarcoId => {
        const sarcoContract = (await safeContractCall(
          this.viewStateFacet,
          'getSarcophagus',
          [sarcoId],
          options
        )) as unknown as SarcophagusResponseContract;

        const currentTimeMs = (await this.utils.getCurrentTimeSec(this.signer.provider!)) * 1000;
        return {
          ...sarcoContract,
          state: this.utils.getSarcophagusState(sarcoContract, gracePeriod.toNumber(), currentTimeMs),
          id: sarcoId,
        } as SarcophagusData;
      })
    );

    return sarcophagi;
  }
}
