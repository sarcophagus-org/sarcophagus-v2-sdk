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
import Arweave from "arweave";

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

    if (!window.ethereum) {
      throw new Error('WebSarcoClient requires window.ethereum to be defined');
    }

    this.provider = window.ethereum;
    this.signer = new ethers.providers.Web3Provider(this.provider as any).getSigner();
  }

  async init(initParams: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<void> {
    const params = await sarcoClientInitSchema.validate(initParams);

    const providerUrl = new ethers.providers.Web3Provider(this.provider as any).connection.url;

    const networkConfigByChainId = new Map<number, SarcoNetworkConfig>([
      [1, mainnetNetworkConfig(providerUrl, params.etherscanApiKey)],
      [5, goerliNetworkConfig(providerUrl, params.etherscanApiKey)],
      [11155111, sepoliaNetworkConfig(providerUrl, params.etherscanApiKey)],
    ]);

    const networkConfig = networkConfigByChainId.get(params.chainId);
    if (!networkConfig) {
      throw new Error(`Unsupported chainId: ${params.chainId}`);
    }
    this.networkConfig = networkConfig;

    this.p2pNode = await bootLip2p();
    // TODO: Allow client to choose when to start/stop libp2p node
    await this.startLibp2pNode();

    // Custom provider for bundlr that uses a Sarcophagus DAO server-provided public key to sign transactions to sponsor
    // upload costs for embalmers.
    const bundlrProvider = {
      getPublicKey: async () => params.bundlrPublicKey,
      getSigner: () => {
        return {
          getAddress: () => params.bundlrPublicKey, // pubkey is address for TypedEthereumSigner
          _signTypedData: async (
            _domain: never,
            _types: never,
            message: { address: string; 'Transaction hash': Uint8Array }
          ) => {
            let convertedMsg = Buffer.from(message['Transaction hash']).toString('hex');
            const res = await fetch('https://api.encryptafile.com/bundlr/signData', {
              method: 'POST',
              body: JSON.stringify({ signatureData: convertedMsg }),
            });
            const { signature } = await res.json();
            const bSig = Buffer.from(signature, 'hex');
            // pad & convert so it's in the format the signer expects to have to convert from.
            const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString('hex');
            return pad;
          },
        };
      },

      _ready: () => {},
    };

    const bundlrConfig = {
      timeout: 100000,
      providerUrl: networkConfig.bundlr.providerUrl,
    };

    this._bundlr = new SarcoWebBundlr(
      this.networkConfig.bundlr.nodeUrl,
      this.networkConfig.bundlr.currencyName,
      bundlrProvider as unknown as ethers.providers.Web3Provider,
      bundlrConfig
    );
    this.utils = new Utils(networkConfig, this.signer);
    this.api = new Api(this.networkConfig.diamondDeployAddress, this.signer, this.networkConfig, this._bundlr, this.arweave);
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
