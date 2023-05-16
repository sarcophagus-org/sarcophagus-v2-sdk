import { ethers, Signer } from 'ethers';
import { getSigner } from './helpers/getSigner';
import { SarcoClientConfig } from './types';
import { Api } from './Api';
import { Token } from './Token';

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 *
 * **NOTE:** If in a browser environment, import the sarcoClient singleton instead.
 */
export class SarcoClient {
  signer: Signer = {} as Signer;
  network: ethers.providers.Network = {} as ethers.providers.Network;
  api: Api;
  token: Token;

  /**
   * Constructs a new SarcoClient instance. The provider defaults to ethers default provider if not
   * provided.
   *
   * @param config - The configuration options for the SarcoClient.
   * @throws Will throw an error if none of the signer, private key, or mnemonic is provided.
   */
  constructor(config?: SarcoClientConfig) {
    this.signer = getSigner(config);
    this.api = new Api(this);
    this.token = new Token(this);
  }

  async connect(customProvider: ethers.providers.Provider) {
    this.signer.connect(customProvider);
  }
}
