import { ethers, Signer } from 'ethers';
import { Libp2p } from 'libp2p';
import { getSigner } from './helpers/getSigner';
import { SarcoClientConfig, SarcoNetworkConfig } from './types';
import { SarcophagusApi } from './SarcophagusApi';
import { Token } from './Token';
import { ArchaeologistApi } from './ArchaeologistApi';
import { bootLip2p } from './libp2p_node';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import { sarcoClientInitSchema, SarcoInitParams } from './helpers/validation';

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 *
 * **NOTE:** If in a browser environment, import the sarcoClient singleton instead.
 */
export class SarcoClient {
  private providerUrl!: string;
  private etherscanApiKey: string = '';
  private p2pNode!: Libp2p;
  private signer: Signer = {} as Signer;
  private networkConfig!: SarcoNetworkConfig;

  api!: SarcophagusApi;
  token!: Token;
  archaeologist!: ArchaeologistApi;
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
  }

  /**
   * Initialises the SarcoClient instance. This method must be called before any other methods
   * can be called.
   *
   * @param params - The configuration options for the SarcoClient.
   * @param onInit - Callback function to be called after the SarcoClient has been initialised.
   */
  async init(initParams: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<void> {
    const params = await sarcoClientInitSchema.validate(initParams);

    if (this.p2pNode?.isStarted()) {
      await this.stopLibp2pNode();
    }

    this.providerUrl = params.providerUrl;

    const networkConfigByChainId = new Map<number, SarcoNetworkConfig>([
      [1, mainnetNetworkConfig(this.providerUrl, params.etherscanApiKey)],
      [5, goerliNetworkConfig(this.providerUrl, params.etherscanApiKey)],
      [11155111, sepoliaNetworkConfig(this.providerUrl, params.etherscanApiKey)],
    ]);

    const networkConfig = networkConfigByChainId.get(params.chainId);
    if (!networkConfig) {
      throw new Error('Unsupported chainId');
    }
    this.networkConfig = networkConfig;

    this.etherscanApiKey = params.etherscanApiKey ?? '';

    this.api = new SarcophagusApi(this.networkConfig.diamondDeployAddress, this.signer, this.networkConfig.subgraphUrl);
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

  connect(customProvider: ethers.providers.Provider) {
    this.signer.connect(customProvider);
  }
}
