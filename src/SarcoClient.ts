import { ethers, Signer } from 'ethers';
import { Libp2p } from 'libp2p';
import { getSigner } from './helpers/getSigner';
import { SarcoClientConfig, SarcoInitConfig, SarcoNetworkConfig } from './types';
import { Api } from './Api';
import { Token } from './Token';
import { ArchaeologistApi } from './ArchaeologistApi';
import { bootLip2p } from './libp2p_node';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 *
 * **NOTE:** If in a browser environment, import the sarcoClient singleton instead.
 */
export class SarcoClient {
  signer: Signer = {} as Signer;
  api!: Api;
  token!: Token;
  archaeologist!: ArchaeologistApi;
  providerUrl!: string;
  etherscanApiKey!: string;
  p2pNode!: Libp2p;
  networkConfig!: SarcoNetworkConfig;

  isInitialised: boolean = false;

  /**
   * Constructs a new SarcoClient instance. The provider defaults to ethers default provider if not
   * provided.
   *
   * @param config - The configuration options for the SarcoClient.
   * @throws Will throw an error if none of the signer, private key, or mnemonic is provided.
   */
  constructor(config?: SarcoClientConfig) {
    this.signer = getSigner(config);
  }

  async init(config: SarcoInitConfig) {
    if (this.p2pNode?.isStarted()) {
      await this.p2pNode.stop();
    }

    switch (config.chainId) {
      case 1:
        this.providerUrl = config.providerUrl ?? 'https://rpc.ankr.com/eth';
        this.networkConfig = mainnetNetworkConfig(this.providerUrl, config.etherscanApiKey);
        break;

      case 5:
        this.providerUrl = config.providerUrl ?? 'https://rpc.ankr.com/eth_goerli';
        this.networkConfig = goerliNetworkConfig(this.providerUrl, config.etherscanApiKey);
        break;

      case 11155111:
        this.providerUrl = config.providerUrl ?? 'https://rpc.ankr.com/eth_sepolia';
        this.networkConfig = sepoliaNetworkConfig(this.providerUrl, config.etherscanApiKey);
        break;

      default:
        throw new Error('Unsupported chainId');
    }

    this.etherscanApiKey = config.etherscanApiKey ?? '';

    const p2pNode = await bootLip2p();

    this.p2pNode = p2pNode;
    this.api = new Api(this);
    this.token = new Token(this);
    this.archaeologist = new ArchaeologistApi(this);

    this.isInitialised = true;
    config.onInit?.(p2pNode);
  }

  async connect(customProvider: ethers.providers.Provider) {
    this.signer.connect(customProvider);
  }
}
