import { Signer, ethers } from 'ethers';
import { ApiConfig as ArweaveConfig } from 'arweave/node/lib/api';

export interface CallOptions {
  ignoreSafeCall?: boolean;
}

export interface SarcoBundlrConfig {
  currencyName: string;
  nodeUrl: string;
  providerUrl: string;
}

/**
 * Network configuration options
 */
export interface SarcoNetworkConfig {
  chainId: number;
  networkName: string;
  networkShortName: string;
  sarcoTokenAddress: string;
  diamondDeployAddress: string;
  etherscanApiUrl: string;
  explorerUrl: string;
  etherscanApiKey: string;
  bundlr: SarcoBundlrConfig;
  arweaveConfig: ArweaveConfig;
  subgraphUrl: string;
  providerUrl?: string;
  signalServerPort?: number;
}
