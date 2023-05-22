import { EmbalmerFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { ethers } from 'ethers';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions, SarcophagusRewrap } from './types';
import {
  SarcophagusSettings,
  sarcophagusSettingsSchema,
  archaeologistSettingsArraySchema,
  ArchaeologistSettings,
} from './helpers/validation';
import { getSarcophagusRewraps } from './helpers/subgraph';

/**
 * The Sarcophagus API class provides a high-level interface for interacting with
 * sarcophagi on the Sarcophagus V2 protocol.
 */
export class SarcophagusApi {
  private embalmerFacet: ethers.Contract;
  private subgraphUrl: string;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, subgraphUrl: string) {
    this.embalmerFacet = new ethers.Contract(diamondDeployAddress, EmbalmerFacet__factory.abi, signer);
    this.subgraphUrl = subgraphUrl;
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

  /**
   * Gets the rewraps on a sarcophagus.
   *
   * @param sarcoId - The ID of the sarcophagus to get the rewraps of
   * @returns The rewraps on the sarcophagus
   * */
  async getRewrapsOnSarcophagus(sarcoId: string): Promise<SarcophagusRewrap[]> {
    return (await getSarcophagusRewraps(this.subgraphUrl, sarcoId)).map(r => ({
      rewrapTimestamp: Number.parseInt(r.blockTimestamp),
      diggingFeesPaid: ethers.utils.parseEther( r.totalDiggingFees),
      protocolFeesPaid: ethers.utils.parseEther(r.rewrapSarcophagusProtocolFees),
    }));
  }
}
