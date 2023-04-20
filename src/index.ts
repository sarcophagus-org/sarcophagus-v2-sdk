import { ethers, Signer, Wallet } from "ethers";

export interface SarcoClientConfig {
  signer?: Signer;
  privateKey?: string;
  mnemonic?: string;
  provider?: ethers.providers.Provider;
}

export class SarcoClient {
  private signer: Signer;

  constructor(config: SarcoClientConfig) {
    if (config.signer) {
      this.signer = config.signer;
    } else if (config.privateKey) {
      if (!config.provider) {
        throw new Error("A provider is required when using a private key");
      }
      this.signer = new Wallet(config.privateKey, config.provider);
    } else if (config.mnemonic) {
      if (!config.provider) {
        throw new Error("A provider is required when using a mnemonic");
      }
      this.signer = Wallet.fromMnemonic(config.mnemonic).connect(config.provider);
    } else {
      throw new Error("A signer, private key, or mnemonic must be provided");
    }
  }

  // Your SDK methods will go here
}
