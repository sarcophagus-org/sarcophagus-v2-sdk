import Bundlr from '@bundlr-network/client/build/esm/node/bundlr';
import { ethers, Signer } from 'ethers';
import { Libp2p } from 'libp2p';
import { Api } from './Api';
import { Archaeologist } from './Archaeologist';
import { NodeSarcoClientConfig, nodeSarcoClientSchema } from './helpers/validation';
import { bootLip2p } from './libp2p_node';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import { Token } from './Token';
import { SarcoNetworkConfig } from './types';
import { Utils } from './Utils';
import Arweave from 'arweave';

export class NodeSarcoClient {
  signer: Signer;
  isInitialised: boolean = false;

  api!: Api;
  archaeologist!: Archaeologist;
  bundlr!: Bundlr;
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

    const networkConfig = this.getNetworkConfig(config.providerUrl, config.chainId, {
      etherscanApiKey: config.etherscanApiKey,
      zeroExApiKey: config.zeroExApiKey,
    });
    this.networkConfig = networkConfig;

    this.signer = wallet.connect(customProvider);

    this.bundlr = new Bundlr(networkConfig.bundlr.nodeUrl, networkConfig.bundlr.currencyName, config.privateKey, {
      providerUrl: networkConfig.providerUrl,
    });
    this.api = new Api(networkConfig.diamondDeployAddress, this.signer, networkConfig, this.bundlr, this.arweave);
    this.token = new Token(networkConfig.sarcoTokenAddress, this.networkConfig.diamondDeployAddress, this.signer);
    this.utils = new Utils(networkConfig, this.signer);
  }

  public async init(): Promise<Promise<void>> {
    this.p2pNode = await bootLip2p();
    this.archaeologist = new Archaeologist(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig.subgraphUrl,
      this.networkConfig.apiUrlBase,
      this.p2pNode,
      this.utils
    );

    this.isInitialised = true;
  }

  public async startLibp2pNode() {
    console.log(`LibP2P node starting with peerID: ${this.p2pNode.peerId.toString()}`);
    return this.p2pNode.start();
  }

  public async stopLibp2pNode() {
    return this.p2pNode.stop();
  }

  private getNetworkConfig(
    providerUrl: string,
    chainId: number,
    config: { etherscanApiKey?: string; zeroExApiKey?: string }
  ): SarcoNetworkConfig {
    const networkConfigByChainId = new Map<number, SarcoNetworkConfig>([
      [1, mainnetNetworkConfig(providerUrl, config)],
      [5, goerliNetworkConfig(providerUrl, config)],
      [11155111, sepoliaNetworkConfig(providerUrl, config)],
    ]);
    const networkConfig = networkConfigByChainId.get(chainId);

    if (!networkConfig) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    return networkConfig;
  }
}
