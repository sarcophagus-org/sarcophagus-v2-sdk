import { ApiConfig as ArweaveConfig } from 'arweave/node/lib/api';
import { ArchaeologistData } from './archaeologist';
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
  providerUrl?: string;
  zeroExApiKey?: string;
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

export interface SubmitSarcophagusProps {
  name: string;
  recipientState: RecipientState;
  resurrection: number;
  selectedArchaeologists: ArchaeologistData[];
  requiredArchaeologists: number;
  negotiationTimestamp: number;
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
  threshold: number;
  creationTime: number;
  maximumRewrapInterval: number;
  maximumResurrectionTime: number;
}

export type SubmitSarcophagusArgsTuple = [string, SubmitSarcophagusSettings, ContractArchaeologist[], string];
