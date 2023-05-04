import { EmbalmerFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions } from './types';
import {
  SarocphagusSettings,
  sarcophagusSettingsSchema,
  archaeologistSettingsArraySchema,
  ArchaeologistSettings,
} from './helpers/validation';

// Temporary
// TODO: Get this from the contracts package
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';

export class Api {
  sarcoClient: SarcoClient;
  embalmerFacet: ethers.Contract;

  constructor(sarcoClient: SarcoClient) {
    this.sarcoClient = sarcoClient;
    this.embalmerFacet = new ethers.Contract(
      goerliDiamondAddress,
      EmbalmerFacet__factory.abi,
      this.sarcoClient.signer
    );
  }

  async createSarcophagus(
    sarcoId: string,
    sarcophagusSettings: SarocphagusSettings,
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
    return safeContractCall(
      this.embalmerFacet,
      'rewrapSarcophagus',
      [sarcoId, resurrectionTime],
      options
    );
  }

  async burySarcophagus(
    sarcoId: string,
    options: CallOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
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
  async cleanSarcophagus(
    sarcoId: string,
    options: CallOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    return safeContractCall(this.embalmerFacet, 'cleanSarcophagus', [sarcoId], options);
  }
}
