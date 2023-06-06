import { Api } from '../shared/Api';
import { bootLip2p } from '../shared/libp2p_node';
import { Libp2p } from 'libp2p';
import { ethers, Signer } from 'ethers';
import { SarcoWebBundlr } from './SarcoWebBundlr';
import { Token } from '../shared/Token';
import { Utils } from '../shared/Utils';
import { ArchaeologistApi } from '../shared/ArchaeologistApi';
import { sarcoClientInitSchema, SarcoInitParams } from '../shared/helpers/validation';
import { goerliNetworkConfig, mainnetNetworkConfig, SarcoNetworkConfig, sepoliaNetworkConfig } from 'shared';

export class WebSarcoClient {
  public api!: Api;
  public token!: Token;
  public bundlr!: SarcoWebBundlr;
  public archaeologist!: ArchaeologistApi;
  public utils: Utils;
  public isInitialised: boolean = false;

  private signer: Signer;
  private networkConfig!: SarcoNetworkConfig;
  private provider: ethers.providers.Provider;
  private p2pNode!: Libp2p;

  constructor() {
    if (!window.ethereum) {
      throw new Error('WebSarcoClient requires window.ethereum to be defined');
    }

    this.provider = window.ethereum;
    this.signer = new ethers.providers.Web3Provider(this.provider as any).getSigner();
    this.utils = new Utils();
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

    this.api = new Api(this.networkConfig.diamondDeployAddress, this.signer, this.networkConfig.subgraphUrl);
    this.token = new Token(this.networkConfig.sarcoTokenAddress, this.networkConfig.diamondDeployAddress, this.signer);
    this.archaeologist = new ArchaeologistApi(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig.subgraphUrl,
      this.p2pNode
    );
    this.bundlr = new SarcoWebBundlr(
      this.networkConfig.bundlr.nodeUrl,
      this.networkConfig.bundlr.currencyName,
      this.provider
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
}
