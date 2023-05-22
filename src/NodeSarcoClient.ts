import Bundlr from '@bundlr-network/client/build/cjs/node/bundlr';
import { ethers, Signer } from 'ethers';
import { Api } from './Api';
import { mainnetNetworkConfig } from './networkConfig';
import { Token } from './Token';

export interface NodeSarcoClientConfig {
  privateKey: string;
  providerUrl: string;
}

export class NodeSarcoClient {
  api: Api;
  token: Token;
  signer: Signer;
  bundlr: Bundlr;

  constructor(config: NodeSarcoClientConfig) {
    this.api = new Api(this);
    this.token = new Token(this);

    const customProvider = new ethers.providers.JsonRpcProvider(config.providerUrl);
    this.signer = new ethers.providers.Web3Provider(customProvider as any).getSigner();

    this.bundlr = new Bundlr(
      mainnetNetworkConfig.bundlr.nodeUrl,
      mainnetNetworkConfig.bundlr.currencyName,
      config.privateKey,
      {
        providerUrl: config.providerUrl,
      }
    );
  }
}
