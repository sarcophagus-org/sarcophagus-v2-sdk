import { SarcophagusApi } from './SarcophagusApi';
import { bootLip2p } from './libp2p_node';
import { Libp2p } from 'libp2p';
import { ethers, Signer } from 'ethers';
import { SarcoWebIrys } from './SarcoWebIrys';
import { Token } from './Token';
import { Utils } from './Utils';
import { ArchaeologistApi } from './ArchaeologistApi';
import { sarcoClientInitSchema, SarcoInitParams } from './helpers/validation';
import { SarcoNetworkConfig } from './types';
import { getNetworkConfigBuilder } from './networkConfig';
import Arweave from 'arweave';
import { sponsoredBundlrProvider } from './helpers/bundlr';

export class WebSarcoClient {
  public api!: SarcophagusApi;
  public token!: Token;
  public archaeologist!: ArchaeologistApi;
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
      throw new Error('WebSarcoClient can only be used in a browser environment');
    }

    this.provider = {} as ethers.providers.Provider;
    this.signer = {} as Signer;
  }

  /**
   * Initialises the WebSarcoClient instance. Must be called before any other methods are called.
   * This can be called at any time after initialisation to re-initialise the client with different parameters.
   *
   * @param initParams - The parameters to initialise the WebSarcoClient instance with
   * @param onInit - A callback function that is called after the WebSarcoClient instance is initialised
   * @returns void
   * */
  async init(initParams: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<SarcoNetworkConfig> {
    if (window.ethereum) {
      this.provider = window.ethereum;
      this.signer = new ethers.providers.Web3Provider(this.provider as any).getSigner();
    } else {
      throw new Error('No ethereum provider found');
    }

    const params = await sarcoClientInitSchema.validate(initParams);

    const web3Provider = new ethers.providers.Web3Provider(this.provider as any);
    const providerUrl = web3Provider.connection.url;

    const getNetworkConfig = getNetworkConfigBuilder(params.chainId);

    if (!getNetworkConfig) {
      throw new Error(`Unsupported chainId: ${params.chainId}`);
    }

    const networkConfig = getNetworkConfig({
      etherscanApiKey: params.etherscanApiKey,
      polygonScanApiKey: params.polygonScanApiKey,
      basescanApiKey: params.basescanApiKey,
      zeroExApiKey: params.zeroExApiKey,
    });

    this.networkConfig = networkConfig;

    this.p2pNode = await bootLip2p();
    // TODO: Allow client to choose when to start/stop libp2p node
    await this.startLibp2pNode();

    const bundlr = this.getBundlr();

    this.api = new SarcophagusApi(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig,
      bundlr,
      this.arweave
    );

    this.utils = new Utils(networkConfig, this.signer);
    this.token = new Token(this.networkConfig.sarcoTokenAddress, this.networkConfig.diamondDeployAddress, this.signer);
    this.archaeologist = new ArchaeologistApi(
      this.networkConfig.diamondDeployAddress,
      this.signer,
      this.networkConfig.subgraphUrl,
      this.networkConfig.apiUrlBase,
      this.p2pNode,
      this.utils
    );

    this.isInitialised = true;
    onInit(this.p2pNode);

    return networkConfig;
  }

  /**
   * Gets bundlr provider, either sponsored or user-provided
   */
  getBundlr(signerPublicKey?: string, signerEndpoint?: string) {
    // If signingPublicKey is provided, use sponsoring provider
    const bundlrProvider: ethers.providers.Web3Provider = signerPublicKey
      ? sponsoredBundlrProvider(signerPublicKey, signerEndpoint!)
      : new ethers.providers.Web3Provider(this.provider as any);

    const bundlrConfig = {
      timeout: 100000,
      providerUrl: bundlrProvider.connection ? bundlrProvider.connection.url : '',
    };

    return new SarcoWebIrys(
      this.networkConfig.bundlr.nodeUrl,
      this.networkConfig.bundlr.currencyName,
      bundlrProvider,
      bundlrConfig
    );
  }

  /**
   * Initialises the bundlr instance, used to upload the arweave file
   */
  public async connectBundlr() {
    return this.bundlr.connect();
  }

  /**
   * Set sponsored bundlr instance
   */
  public setSponsoredBundlr = async (signerPublicKey: string, signerEndpoint: string) => {
    const bundlr = this.getBundlr(signerPublicKey, signerEndpoint);
    this.api.setBundlr(bundlr);
    await this.connectBundlr();
  };

  async startLibp2pNode() {
    console.log(`LibP2P node starting with peerID: ${this.p2pNode.peerId.toString()}`);
    return this.p2pNode.start();
  }

  async stopLibp2pNode() {
    return this.p2pNode.stop();
  }

  // TODO: Replicate this pattern for all other properties that should only be accessed after initialisation
  public get bundlr(): SarcoWebIrys {
    if (!this.isInitialised) {
      throw new Error('WebSarcoClient is not initialised');
    }

    return this.api.bundlr as SarcoWebIrys;
  }
}
