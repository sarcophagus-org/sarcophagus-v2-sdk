import { Api } from './Api';
import { bootLip2p } from './libp2p_node';
import { Libp2p } from 'libp2p';
import { ethers, Signer } from 'ethers';
import { SarcoWebBundlr } from './SarcoWebBundlr';
import { Token } from './Token';
import { Utils } from './Utils';
import { Archaeologist } from './Archaeologist';
import { sarcoClientInitSchema, SarcoInitParams } from './helpers/validation';
import { SarcoNetworkConfig } from './types';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import Arweave from 'arweave';

export class WebSarcoClient {
  public api!: Api;
  public token!: Token;
  private _bundlr!: SarcoWebBundlr;
  public archaeologist!: Archaeologist;
  public utils!: Utils;
  public isInitialised: boolean = false;

  private signer: Signer;
  private networkConfig!: SarcoNetworkConfig;
  private provider: ethers.providers.Provider;
  private p2pNode!: Libp2p;

  // @ts-ignore
  private arweave: Arweave = Arweave.default;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('WebSarcoClient can only be used in a browser envoronment');
    }

    this.provider = {} as ethers.providers.Provider;
    this.signer = {} as Signer;

    if (window.ethereum) {
      this.provider = window.ethereum;
      this.signer = new ethers.providers.Web3Provider(this.provider as any).getSigner();
    }
  }

  async init(initParams: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<void> {
    const params = await sarcoClientInitSchema.validate(initParams);

    const providerUrl = new ethers.providers.Web3Provider(this.provider as any).connection.url;

    const networkConfigByChainId = new Map<number, SarcoNetworkConfig>([
      [1, mainnetNetworkConfig(providerUrl, initParams.etherscanApiKey)],
      [5, goerliNetworkConfig(providerUrl, initParams.etherscanApiKey)],
      [11155111, sepoliaNetworkConfig(providerUrl, initParams.etherscanApiKey)],
    ]);

    const networkConfig = networkConfigByChainId.get(params.chainId);
    if (!networkConfig) {
      throw new Error(`Unsupported chainId: ${params.chainId}`);
    }
    this.networkConfig = networkConfig;

    this.p2pNode = await bootLip2p();
    // TODO: Allow client to choose when to start/stop libp2p node
    await this.startLibp2pNode();

    this._bundlr = new SarcoWebBundlr(
      this.networkConfig.bundlr.nodeUrl,
      this.networkConfig.bundlr.currencyName,
      new ethers.providers.Web3Provider(this.provider as any),
      {
        timeout: 100000,
        providerUrl: networkConfig.bundlr.providerUrl,
      }
    );
    this.utils = new Utils(networkConfig, this.signer);
    this.api = new Api(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig,
      this._bundlr,
      this.arweave
    );
    this.token = new Token(this.networkConfig.sarcoTokenAddress, this.networkConfig.diamondDeployAddress, this.signer);
    this.archaeologist = new Archaeologist(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig.subgraphUrl,
      this.p2pNode,
      this.utils
    );

    this.isInitialised = true;
    onInit(this.p2pNode);
  }

  async startLibp2pNode() {
    console.log(`LibP2P node starting with peerID: ${this.p2pNode.peerId.toString()}`);
    return this.p2pNode.start();
  }

  async stopLibp2pNode() {
    return this.p2pNode.stop();
  }

  // TODO: Replicate this pattern for all other properties that should only be accessed after initialisation
  public get bundlr(): SarcoWebBundlr {
    if (!this.isInitialised) {
      throw new Error('WebSarcoClient is not initialised');
    }

    return this._bundlr;
  }
}
