import { EmbalmerFacet__factory, ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions, SarcoNetworkConfig } from './types';
import {
  SarcophagusSettings,
  sarcophagusSettingsSchema,
  archaeologistSettingsArraySchema,
  ArchaeologistSettings,
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
} from '../types/sarcophagi';
// import { getCurrentTimeSec } from '../../helpers/misc';
import { decrypt } from './helpers/encryption';
import { arrayify } from 'ethers/lib/utils';
import { combine } from 'shamirs-secret-sharing-ts';
import { fetchArweaveFile } from './helpers/arweaveUtil';
import { ArweaveResponse, OnDownloadProgress } from './types/arweave';

/**
 * The Sarcophagus API class provides a high-level interface for interacting with
 * sarcophagi on the Sarcophagus V2 protocol.
 */
export class SarcophagusApi {
  private embalmerFacet: ethers.Contract;
  private viewStateFacet: ethers.Contract;
  private subgraphUrl: string;
  private signer: ethers.Signer;
  private networkConfig: SarcoNetworkConfig;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, networkConfig: SarcoNetworkConfig) {
    this.embalmerFacet = new ethers.Contract(diamondDeployAddress, EmbalmerFacet__factory.abi, signer);
    this.viewStateFacet = new ethers.Contract(diamondDeployAddress, ViewStateFacet__factory.abi, signer);
    this.subgraphUrl = networkConfig.subgraphUrl;
    this.signer = signer;
    this.networkConfig = networkConfig;
  }
}
