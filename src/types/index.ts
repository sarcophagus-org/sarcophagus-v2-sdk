import { ethers, Signer, Wallet } from 'ethers';

/**
 * Configuration options for the SarcoClient class.
 */
export interface SarcoClientConfig {
  signer?: Signer;
  privateKey?: string;
  mnemonic?: string;
  provider?: ethers.providers.Provider;
}
