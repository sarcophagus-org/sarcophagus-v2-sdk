import { ethers, Signer, Wallet } from 'ethers';
import { SarcoClientConfig } from './types';
import * as api from './api';
import * as utils from './utils';
import * as bundlr from './bundlr';
import * as archaeologist from './archaeologist';

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 */
export class SarcoClient {
  private signer: Signer;
  public api: typeof api;
  public utils: typeof utils;
  public bundlr: typeof bundlr;
  public archaeologist: typeof archaeologist;

  /**
   * Constructs a new SarcoClient instance. The provider defaults to ethers default provider if not
   * provided.
   *
   * @param config - The configuration options for the SarcoClient.
   * @throws Will throw an error if none of the signer, private key, or mnemonic is provided.
   */
  constructor(config: SarcoClientConfig) {
    const provider = config.provider || ethers.getDefaultProvider();

    if (config.signer) {
      this.signer = config.signer;
    } else if (config.privateKey) {
      this.signer = new Wallet(config.privateKey, provider);
    } else if (config.mnemonic) {
      this.signer = Wallet.fromMnemonic(config.mnemonic).connect(provider);
    } else {
      throw new Error('A signer, private key, or mnemonic must be provided');
    }

    this.api = api;
    this.utils = utils;
    this.bundlr = bundlr;
    this.archaeologist = archaeologist;
  }
}
