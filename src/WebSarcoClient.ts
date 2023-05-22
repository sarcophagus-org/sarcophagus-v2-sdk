import { Api } from 'Api';
import { ethers, Signer } from 'ethers';
import { mainnetNetworkConfig } from './networkConfig';
import { SarcoWebBundlr } from './SarcoWebBundlr';
import { Token } from './Token';

export class WebSarcoClient {
  api: Api;
  token: Token;
  signer: Signer;
  provider: ethers.providers.Provider;
  bundlr: SarcoWebBundlr;

  constructor() {
    this.api = new Api(this);
    this.token = new Token(this);

    this.provider = this.getProvider();
    this.signer = new ethers.providers.Web3Provider(this.provider as any).getSigner();
    this.bundlr = new SarcoWebBundlr(
      mainnetNetworkConfig.bundlr.nodeUrl,
      mainnetNetworkConfig.bundlr.currencyName,
      this.provider
    );
  }

  private getProvider(): ethers.providers.Provider {
    return typeof window.ethereum !== 'undefined'
      ? new ethers.providers.Web3Provider(window.ethereum as any)
      : ethers.getDefaultProvider();
  }
}
