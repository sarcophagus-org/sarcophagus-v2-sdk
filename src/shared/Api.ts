import { EmbalmerFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { ethers } from 'ethers';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions } from './types';
import {
  ArchaeologistSettings,
  SarcophagusSettings,
  archaeologistSettingsArraySchema,
  sarcophagusSettingsSchema,
} from './helpers/validation';
import { getSubgraphSarcophagusWithRewraps } from './helpers/subgraph';

export class Api {
  private embalmerFacet: ethers.Contract;
  private subgraphUrl: string;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, subgraphUrl: string) {
    this.embalmerFacet = new ethers.Contract(diamondDeployAddress, EmbalmerFacet__factory.abi, signer);
    this.subgraphUrl = subgraphUrl;
  }

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

  async rewrapSarcophagus(
    sarcoId: string,
    resurrectionTime: number,
    options: CallOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    return safeContractCall(this.embalmerFacet, 'rewrapSarcophagus', [sarcoId, resurrectionTime], options);
  }

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
}
