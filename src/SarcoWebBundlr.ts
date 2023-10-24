import { IrysConfig } from '@irys/sdk/build/esm/common/types';
import WebIrys from '@irys/sdk/build/esm/web/irys'
import { ethers } from 'ethers';
/**
 * A custom WebIrys class for the Sarcophagus SDK that allows for the injection of a public key.
 * Only needs to be used in a browser environment.
 */
export class SarcoWebBundlr extends WebIrys {
  provider: ethers.providers.Web3Provider;
  isConnected: boolean = false;

  constructor(url: string, token: string, provider: ethers.providers.Web3Provider, config: IrysConfig) {
    super({url, token, wallet: { provider}, config});
    this.provider = provider;
  }

  /**
   * Prompts a wallet signature to add the public key to the bundlr instance
   */
  async connect() {
    // Prompt a signature from the user to get the user's public key
    await super.ready();

    // Get the public key that was obtained from the signature and return it
    // The public key can be saved and injected into the client on future page loads
    const publicKey = this.tokenConfig.getSigner().publicKey;
    this.isConnected = true;
    return JSON.parse(JSON.stringify(publicKey)).data;
  }

  disconnect() {
    this.address = undefined;
    (this.tokenConfig as any)._address = undefined;
    (this.tokenConfig as any).signer = undefined;
    (this.tokenConfig as any).providerInstance = undefined;
    (this.tokenConfig as any).w3signer = undefined;
    this.isConnected = false;
  }
}
