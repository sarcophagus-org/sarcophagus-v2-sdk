import { Signer, ethers } from 'ethers';

/**
 * Configuration options for the SarcoClient class.
 */
export interface SarcoClientConfig {
  signer?: Signer;
  privateKey?: string;
  mnemonic?: string;
  provider?: ethers.providers.Provider;
}

export interface CallOptions {
  ignoreSafeCall?: boolean;
}

export type Address = `0x${string}`;
