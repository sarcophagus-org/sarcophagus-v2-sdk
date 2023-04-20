import { ethers, Signer, Wallet } from "ethers";

/**
 * Configuration options for the SarcoClient class.
 */
export interface SarcoClientConfig {
  signer?: Signer;
  privateKey?: string;
  mnemonic?: string;
  provider?: ethers.providers.Provider;
}

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 */
export class SarcoClient {
  private signer: Signer;

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
      throw new Error("A signer, private key, or mnemonic must be provided");
    }
  }

  helloWorld() {
    return "Hello World";
  }

  // SDK methods will go here
}
