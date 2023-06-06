import Bundlr from '@bundlr-network/client/build/cjs/node/bundlr';
import { ethers, Signer } from 'ethers';
import { sarcoClientInitSchema, SarcoInitParams } from '../shared/helpers/validation';
import { Libp2p } from 'libp2p';
import { bootLip2p } from '../shared/libp2p_node';
import { SarcoNetworkConfig } from '../shared/types';
import { SarcophagusApi } from '../shared/SarcophagusApi';
import { ArchaeologistApi } from '../shared/ArchaeologistApi';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from '../shared/networkConfig';
import { Token } from '../shared/Token';

export interface NodeSarcoClientConfig {
  privateKey: string;
  providerUrl: string;
}

export class NodeSarcoClient {
  api!: SarcophagusApi;
  token!: Token;
  archaeologist!: ArchaeologistApi;
  signer: Signer;
  bundlr!: Bundlr;
  isInitialised: boolean = false;

  private providerUrl!: string;
  private etherscanApiKey: string = '';
  private p2pNode!: Libp2p;
  private networkConfig!: SarcoNetworkConfig;
  private privateKey: string;

  constructor(config: NodeSarcoClientConfig) {
    const customProvider = new ethers.providers.JsonRpcProvider(config.providerUrl);
    this.signer = new ethers.providers.Web3Provider(customProvider as any).getSigner();
    this.privateKey = config.privateKey;
    this.providerUrl = config.providerUrl;
  }

  async init(initParams: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<void> {
    const params = await sarcoClientInitSchema.validate(initParams);

    const networkConfigByChainId = new Map<number, SarcoNetworkConfig>([
      [1, mainnetNetworkConfig(this.providerUrl, initParams.etherscanApiKey)],
      [5, goerliNetworkConfig(this.providerUrl, initParams.etherscanApiKey)],
      [11155111, sepoliaNetworkConfig(this.providerUrl, initParams.etherscanApiKey)],
    ]);

    const networkConfig = networkConfigByChainId.get(params.chainId);
    if (!networkConfig) {
      throw new Error(`Unsupported chainId: ${params.chainId}`);
    }

    this.bundlr = new Bundlr(networkConfig.bundlr.nodeUrl, networkConfig.bundlr.currencyName, this.privateKey, {
      providerUrl: networkConfig.bundlr.providerUrl,
    });

    this.networkConfig = networkConfig;
    this.etherscanApiKey = params.etherscanApiKey ?? '';

    this.api = new SarcophagusApi(this.networkConfig.diamondDeployAddress, this.signer, this.networkConfig);
    this.token = new Token(this.networkConfig.sarcoTokenAddress, this.networkConfig.diamondDeployAddress, this.signer);

    this.p2pNode = await bootLip2p();
    // TODO: Allow client to choose when to start/stop libp2p node
    await this.startLibp2pNode();

    this.archaeologist = new ArchaeologistApi(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig.subgraphUrl,
      this.p2pNode
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
