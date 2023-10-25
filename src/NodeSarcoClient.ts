import Irys from '@irys/sdk';
import { ethers, Signer } from 'ethers';
import { Libp2p } from 'libp2p';
import { SarcophagusApi } from './SarcophagusApi';
import { ArchaeologistApi } from './ArchaeologistApi';
import { NodeSarcoClientConfig, nodeSarcoClientSchema } from './helpers/validation';
import { bootLip2p } from './libp2p_node';
import { getNetworkConfigBuilder } from './networkConfig';
import { Token } from './Token';
import { SarcoNetworkConfig } from './types';
import { Utils } from './Utils';
import Arweave from 'arweave';

export class NodeSarcoClient {
  signer: Signer;
  isInitialised: boolean = false;

  api!: SarcophagusApi;
  archaeologist!: ArchaeologistApi;
  bundlr!: Irys;
  token!: Token;
  utils!: Utils;

  private networkConfig!: SarcoNetworkConfig;
  private p2pNode!: Libp2p;

  // @ts-ignore
  private arweave: Arweave = Arweave;

  constructor(clientConfig: NodeSarcoClientConfig) {
    const config = nodeSarcoClientSchema.validateSync(clientConfig);
    const customProvider = new ethers.providers.JsonRpcProvider(config.providerUrl);
    const wallet = new ethers.Wallet(config.privateKey, customProvider);

    const getNetworkConfig = getNetworkConfigBuilder(config.chainId);

    if (!getNetworkConfig) {
      throw new Error(`Unsupported chainId: ${config.chainId}`);
    }

    const networkConfig = getNetworkConfig({
      etherscanApiKey: config.etherscanApiKey,
      zeroExApiKey: config.zeroExApiKey,
    });
    this.networkConfig = networkConfig;

    this.signer = wallet.connect(customProvider);

    this.bundlr = new Irys({
      url: networkConfig.bundlr.nodeUrl,
      token: networkConfig.bundlr.currencyName,
      key: config.privateKey,
      config: {
        providerUrl: config.providerUrl,
      },
    });
    this.api = new SarcophagusApi(
      networkConfig.diamondDeployAddress,
      this.signer,
      networkConfig,
      this.bundlr,
      this.arweave
    );
    this.token = new Token(networkConfig.sarcoTokenAddress, this.networkConfig.diamondDeployAddress, this.signer);
    this.utils = new Utils(networkConfig, this.signer);
  }

  public async init(): Promise<SarcoNetworkConfig> {
    this.p2pNode = await bootLip2p();
    this.archaeologist = new ArchaeologistApi(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig.subgraphUrl,
      this.networkConfig.apiUrlBase,
      this.p2pNode,
      this.utils
    );

    this.isInitialised = true;
    return this.networkConfig;
  }

  public async startLibp2pNode() {
    console.log(`LibP2P node starting with peerID: ${this.p2pNode.peerId.toString()}`);
    return this.p2pNode.start();
  }

  public async stopLibp2pNode() {
    return this.p2pNode.stop();
  }
}
