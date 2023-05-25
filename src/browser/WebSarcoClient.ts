import { Api } from '../shared/Api';
import { bootLip2p } from '../shared/libp2p_node';
import { Libp2p } from 'libp2p';
import { ethers, Signer } from 'ethers';
import { SarcoWebBundlr } from './SarcoWebBundlr';
import { Token } from '../shared/Token';
import { Utils } from '../shared/Utils';
import { ArchaeologistApi } from '../shared/ArchaeologistApi';
import { SarcoInitParams } from '../shared/helpers/validation';

// Temporary
// TODO: move this
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';
const goerliSarcoAddress = '0x4633b43990b41B57b3678c6F3Ac35bA75C3D8436';
const subgraphUrl = 'https://api.studio.thegraph.com/query/44302/sarcotest2/18';
const bundlrNodeUrl = 'https://node1.bundlr.network';
const bundlrCurrencyName = 'ethereum';

export class WebSarcoClient {
  public api: Api;
  public token: Token;
  public bundlr: SarcoWebBundlr;
  public utils: Utils;
  public archaeologist: ArchaeologistApi;
  public isInitialised: boolean = false;

  private signer: Signer;
  private provider: ethers.providers.Provider;
  private p2pNode: Libp2p;

  constructor() {
    console.log('WebSarcoClient constructor!!!');
    this.provider = this.getProvider();
    this.signer = new ethers.providers.Web3Provider(this.provider as any).getSigner();
    this.p2pNode = {} as Libp2p;

    this.api = new Api(goerliDiamondAddress, this.signer, subgraphUrl);
    this.token = new Token(goerliSarcoAddress, goerliDiamondAddress, this.signer);
    this.archaeologist = new ArchaeologistApi(goerliDiamondAddress, this.signer, subgraphUrl, this.p2pNode);
    this.utils = new Utils();
    this.bundlr = new SarcoWebBundlr(bundlrNodeUrl, bundlrCurrencyName, this.provider);
  }

  async init(initParams: SarcoInitParams, onInit = (_: Libp2p) => {}): Promise<void> {
    this.p2pNode = await bootLip2p();
    // TODO: Allow client to choose when to start/stop libp2p node
    await this.startLibp2pNode();
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

  private getProvider(): ethers.providers.Provider {
    return typeof window.ethereum !== 'undefined'
      ? new ethers.providers.Web3Provider(window.ethereum as any)
      : ethers.getDefaultProvider();
  }
}
