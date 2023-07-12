import { ChunkingUploader } from '@bundlr-network/client/build/esm/common/chunkingUploader';
import { BundlrConfig } from '@bundlr-network/client/build/esm/common/types';
import WebBundlr from '@bundlr-network/client/build/esm/web/bundlr';
import { InjectedEthereumSigner } from 'arbundles';
import { ethers } from 'ethers';
import { decrypt, encrypt } from './helpers/encryption';
import { computeAddress } from 'ethers/lib/utils.js';
import { readFileDataAsBase64, arweaveDataDelimiter } from 'helpers/arweaveUtil';
import {
  encryptShardsWithRecipientPublicKey,
  encryptShardsWithArchaeologistPublicKeys,
  encryptMetadataFields,
  chunkedUploaderFileSize,
} from 'helpers/sarco';
import { split } from 'shamirs-secret-sharing-ts';

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

  // TODO: Finish implementation of injectPublicKey function
  /**
   * Injects a public key into the current bundlr instance
   * @param publicKey - The public key to inject
   */
  injectPublicKey(publicKey: Buffer): void {
    // Get the address from the public key
    const _publicKey = Buffer.from(new Uint8Array(publicKey));
    const address = computeAddress(_publicKey);
    const injectedSigner = new InjectedEthereumSigner(this.provider);
    injectedSigner.publicKey = _publicKey;

    // Inject required properties into the WebBundlr instance
    this.address = address.toLowerCase();
    (this.currencyConfig as any)._address = address.toLowerCase();
    (this.currencyConfig as any).signer = injectedSigner;
    (this.currencyConfig as any).providerInstance = this.provider;
    (this.currencyConfig as any).w3signer = this.provider.getSigner();
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
