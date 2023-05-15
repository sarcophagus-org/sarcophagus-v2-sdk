import { ethers, Signer } from 'ethers';
import { Libp2p } from 'libp2p';
import { getSigner } from './helpers/getSigner';
import { SarcoClientConfig, SarcoInitParams, SarcoNetworkConfig } from './types';
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
  etherscanApiKey: string = '';
  p2pNode!: Libp2p;
  networkConfig!: SarcoNetworkConfig;

  isInitialised: boolean = false;

  /**
   * Constructs a new SarcoClient instance.
   *
   * In a non-browser environment, a signer, private key, or mnemonic must be provided along with the provider.
   *
   * In a browser environment, import the `sarco` SarcoClient singleton instead.
   * The provider defaults to ethers' default provider, and to `window.ethereum` in a browser.
   *
   * @param config - The configuration options for the SarcoClient.
   * @throws if none of the signer, private key, or mnemonic is provided in a non-browser environment.
   */
  constructor(config?: SarcoClientConfig) {
    this.signer = getSigner(config);
    // this.init({ chainId: 5, etherscanApiKey: '' });
  }

  /**
   * Initialises the SarcoClient instance. This method must be called before any other methods
   * can be called.
   *
   * @param params - The configuration options for the SarcoClient.
   * @param onInit - Callback function to be called after the SarcoClient has been initialised.
   */
  async init(params: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<void> {
    // TODO: Allow client to choose when to start/stop libp2p node
    if (this.p2pNode?.isStarted()) {
      await this.stopLibp2pNode();
    }

    switch (params.chainId) {
      case 1:
        this.providerUrl = params.providerUrl ?? 'https://rpc.ankr.com/eth';
        this.networkConfig = mainnetNetworkConfig(this.providerUrl, params.etherscanApiKey);
        break;

      case 5:
        this.providerUrl = params.providerUrl ?? 'https://rpc.ankr.com/eth_goerli';
        const networkConfig1 = goerliNetworkConfig(this.providerUrl, params.etherscanApiKey);
        this.networkConfig = networkConfig1;
        console.log('5 network config ', networkConfig1);
        console.log('5 network config from this', this.networkConfig);
        break;

      case 11155111:
        this.providerUrl = params.providerUrl ?? 'https://rpc.ankr.com/eth_sepolia';
        const networkConfig = sepoliaNetworkConfig(this.providerUrl, params.etherscanApiKey);
        this.networkConfig = networkConfig;
        console.log('sep network config ', networkConfig);
        console.log('sep network config from this', this.networkConfig);

        break;

      default:
        throw new Error('Unsupported chainId');
    }

    this.etherscanApiKey = params.etherscanApiKey ?? '';

    this.api = new Api(this);
    this.token = new Token(this);
    this.archaeologist = new ArchaeologistApi(this);

    this.p2pNode = await bootLip2p();
    this.startLibp2pNode();
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

  connect(customProvider: ethers.providers.Provider) {
    this.signer.connect(customProvider);
  }
}
