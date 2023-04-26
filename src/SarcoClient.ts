import { ethers, Signer } from 'ethers';
import { getNetwork } from './helpers/getNetwork';
import { getSigner } from './helpers/getSigner';
import { Api } from './Api';
import { SarcoClientConfig } from './types';

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 */
export class SarcoClient extends Api(Object) {
  signer: Signer = {} as Signer;
  network: ethers.providers.Network = {} as ethers.providers.Network;

  /**
   * Constructs a new SarcoClient instance. The provider defaults to ethers default provider if not
   * provided.
   *
   * @param config - The configuration options for the SarcoClient.
   * @throws Will throw an error if none of the signer, private key, or mnemonic is provided.
   */
  constructor(config?: SarcoClientConfig) {
    super();
    this.initialize(config);
  }

  async initialize(config?: SarcoClientConfig): Promise<void> {
    // Get the signer based on the configuration
    this.signer = getSigner(config);

    // Gets the network the signer is connected to
    this.network = await getNetwork(this.signer);
  }

  async setProvider(customProvider: ethers.providers.Provider) {
    const signer = getSigner({ provider: customProvider });
    this.signer = signer;
    this.network = await getNetwork(this.signer);
  }
}
