import { BundlrConfig } from '@bundlr-network/client/build/cjs/common/types';
import WebBundlr from '@bundlr-network/client/build/cjs/web/bundlr';
import { InjectedEthereumSigner } from 'arbundles';
import { ethers } from 'ethers';
import { computeAddress } from 'ethers/lib/utils';

/**
 * A custom WebBundlr class for the Sarcophagus SDK that allows for the injection of a public key.
 * Only needs to be used in a browser environment.
 */
export class SarcoWebBundlr extends WebBundlr {
  provider: ethers.providers.Provider;

  constructor(url: string, currency: string, provider?: any, config?: BundlrConfig) {
    super(url, currency, provider, config);
    this.provider = provider;
  }

  /**
   * Injects a public key into the current bundlr instance
   * @param publicKey - The public key to inject
   */
  injectPublicKey(publicKey: string): void {
    // Get the address from the public key
    const address = computeAddress(publicKey);

    // Get the web3 provider in order to create an injected signer
    const web3Provider = new ethers.providers.Web3Provider(this.provider as any);

    const injectedSigner = new InjectedEthereumSigner(web3Provider);
    injectedSigner.publicKey = Buffer.from(ethers.utils.arrayify(publicKey));

    // Inject required properties into the WebBundlr instance
    this.address = address.toLowerCase();
    (this.currencyConfig as any)._address = address?.toLowerCase();
    (this.currencyConfig as any).signer = injectedSigner;
    (this.currencyConfig as any).providerInstance = web3Provider;
    (this.currencyConfig as any).w3signer = web3Provider.getSigner();
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
    return ethers.utils.hexlify(publicKey);
  }
}
