import { Signer, ethers } from 'ethers';
import { ApiConfig as ArweaveConfig } from 'arweave/node/lib/api';

/**
 * Configuration options for the SarcoClient class.
 */
export interface SarcoClientConfig {
  signer?: Signer;
  privateKey?: string;
  mnemonic?: string;
  provider?: ethers.providers.Provider;
}

export interface SarcoInitParams {
  chainId: number;
  providerUrl?: string;
  etherscanApiKey?: string;
}

export interface CallOptions {
  ignoreSafeCall?: boolean;
}

export interface BundlrConfig {
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
  bundlr: BundlrConfig;
  arweaveConfig: ArweaveConfig;
  subgraphUrl: string;
  providerUrl?: string;
  signalServerPort?: number;
}
