import { BundlrConfig } from '@bundlr-network/client/build/esm/common/types';
import WebBundlr from '@bundlr-network/client/build/esm/web/bundlr';
import { ethers } from 'ethers';
/**
 * A custom WebBundlr class for the Sarcophagus SDK that allows for the injection of a public key.
 * Only needs to be used in a browser environment.
 */
export class SarcoWebBundlr extends WebBundlr {
  provider: ethers.providers.Web3Provider;
  isConnected: boolean = false;

  constructor(url: string, currency: string, provider: ethers.providers.Web3Provider, config: BundlrConfig) {
    super(url, currency, provider, config);
    this.provider = provider;
  }

  /**
   * Prompts a wallet signature to add the public key to the bundlr instance
   */
  async connect() {
    // Prompt a signature from the user to get the user's public key
    await this.ready();

    // Get the public key that was obtained from the signature and return it
    // The public key can be saved and injected into the client on future page loads
    const publicKey = this.currencyConfig.getSigner().publicKey;
    this.isConnected = true;
    return JSON.parse(JSON.stringify(publicKey)).data;
  }

  disconnect() {
    this.address = undefined;
    (this.currencyConfig as any)._address = undefined;
    (this.currencyConfig as any).signer = undefined;
    (this.currencyConfig as any).providerInstance = undefined;
    (this.currencyConfig as any).w3signer = undefined;
    this.isConnected = false;
  }
}
