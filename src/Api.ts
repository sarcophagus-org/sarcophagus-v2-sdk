import { EmbalmerFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions } from './types';

// Temporary
// TODO: Get this from the contracts package
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';

/**
 * Defines the parameters with which to create the sarcophagus.
 */
interface SarocphagusSettings {
  name: string;
  recipientAddress: string;
  resurrectionTime: number;
  threshold: number;
  creationTime: number;
  maximumRewrapInterval: number;
  maximumResurrectionTime: number;
}

/**
 * Defines the previously negotiated parameters with which to curse an archaeologist. 
 * These parameters should have been previously signed by the archaeologist.
 * v, r, and s are the signature provided by the archaeologist after agreeing to and signing off.
 */
interface ArchaeologistSettings {
  publicKey: string;
  archAddress: string;
  diggingFeePerSecond: BigNumber;
  curseFee: BigNumber;
  v: number;
  r: string;
  s: string;
}

/**
 * The Api class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 */
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
    return await safeContractCall(
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
    return await safeContractCall(
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
    return await safeContractCall(this.embalmerFacet, 'burySarcophagus', [sarcoId], options);
  }
}
