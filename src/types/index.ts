import { ApiConfig as ArweaveConfig } from 'arweave/node/lib/api';
import { ArchaeologistData } from './archaeologist';

export type {
  ArchaeologistData,
  ArchaeologistCurseNegotiationParams,
  ArchaeologistEncryptedShard,
  ArchaeologistException,
  ArchaeologistExceptionCode,
  ArchaeologistNegotiationError,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult,
  ArchaeologistProfile,
  SarcophagusArchaeologist,
  SarcophagusValidationError,
} from './archaeologist';

export type {
  PrivateKeyPublish,
  SarcoCounts,
  SarcophagusData,
  SarcophagusDetails,
  SarcophagusFilter,
  SarcophagusResponseContract,
  SarcophagusRewrap,
  SarcophagusState,
} from './sarcophagi';

export type {
  ArweaveFileMetadata,
  ArweaveResponse,
  ArweaveTxStatus,
  OnDownloadProgress,
  PayloadData,
  UploadArweaveFileOptions,
} from './arweave';

import { BigNumber } from 'ethers';
import { IERC20 } from '@sarcophagus-org/sarcophagus-v2-contracts';

export { RecoverPublicKeyErrorStatus } from './utils';
export type { RecoverPublicKeyResponse } from './utils';
export interface CallOptions {
  ignoreSafeCall?: boolean;
}

export interface SarcoBundlrConfig {
  currencyName: string;
  nodeUrl: string;
}

/**
 * Network configuration options
 */
export interface SarcoNetworkConfig {
  chainId: number;
  networkName: string;
  networkShortName: string;
  tokenSymbol: string;
  sarcoTokenAddress: string;
  sarcoToken?: IERC20;
  diamondDeployAddress: string;
  etherscanApiUrl: string;
  explorerUrl: string;
  etherscanApiKey: string;
  bundlr: SarcoBundlrConfig;
  arweaveConfig: ArweaveConfig;
  subgraphUrl: string;
  zeroExApiKey?: string;
  zeroExApiUrl: string;
  zeroExSellToken: string;
  apiUrlBase: string;
}

export enum RecipientSetByOption {
  ADDRESS = 1,
  PUBLIC_KEY,
  GENERATE,
}

export enum GeneratePDFState {
  UNSET,
  GENERATED,
  DOWNLOADED,
}

export interface RecipientState {
  address: string;
  publicKey: string;
  privateKey?: string;
  setByOption: RecipientSetByOption | null;
  generatePDFState?: GeneratePDFState;
}

export interface SubmitSarcophagusParams {
  name: string;
  recipientPublicKey: string;
  resurrection: number;
  selectedArchaeologists: ArchaeologistData[];
  requiredArchaeologists: number;
  negotiationTimestamp: number;
  /** The archaeologists' public keys. Used to encrypt the outer layer of the split key shares. */
  archaeologistPublicKeys: Map<string, string>;
  archaeologistSignatures: Map<string, string>;
  arweaveTxId: string;
}

export interface ContractArchaeologist {
  archAddress: string;
  diggingFeePerSecond: BigNumber;
  curseFee: BigNumber;
  publicKey: string;
  v: number;
  r: string;
  s: string;
}

export interface SubmitSarcophagusSettings {
  name: string;
  recipientAddress: string;
  resurrectionTime: number;
  /** The threshold value for Shamir's Secret Sharing. */
  threshold: number;
  creationTime: number;
  maximumRewrapInterval: number;
  maximumResurrectionTime: number;
}

export type SubmitSarcophagusArgsTuple = [string, SubmitSarcophagusSettings, ContractArchaeologist[], string];
