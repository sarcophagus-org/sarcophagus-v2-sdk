import { ethers, Signer } from 'ethers';
import { getSigner } from './helpers/getSigner';
import { SarcoClientConfig, SarcoInitConfig } from './types';
import { Api } from './Api';
import { Token } from './Token';
import { ArchaeologistApi } from './ArchaeologistApi';
import { bootLip2p } from 'libp2p_node';
import { Libp2p } from 'libp2p';

/**
 * The SarcoClient class provides a high-level interface for interacting with the Sarcophagus V2 protocol.
 *
 * **NOTE:** If in a browser environment, import the sarcoClient singleton instead.
 */
export class SarcoClient {
  signer: Signer = {} as Signer;
  network: ethers.providers.Network = {} as ethers.providers.Network;
  api: Api;
  token: Token;
  archaeologist: ArchaeologistApi;
  providerUrl?: string;
  etherscanApiKey?: string;
  p2pNode?: Libp2p;
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
    this.api = new Api(this);
    this.token = new Token(this);
    this.archaeologist = new ArchaeologistApi(this);
  }

  async init(config: SarcoInitConfig) {
    let defaultProviderUrl: string;
    switch(config.chainId) {
      case 5:
        defaultProviderUrl = 'https://rpc.ankr.com/eth_goerli';
        break;
      case 1:
        defaultProviderUrl = 'https://rpc.ankr.com/eth';
        break;
      case 11155111:
        defaultProviderUrl = 'https://rpc.ankr.com/eth_sepolia';
        break;
      default:
        throw new Error('Unsupported chainId');
    }

    this.providerUrl = config.providerUrl ?? 'https://rpc.ankr.com/eth_goerli';
    this.etherscanApiKey = config.etherscanApiKey ?? '';
    
    const p2pNode = await bootLip2p();
    
    this.p2pNode = p2pNode;
    this.isInitialised = true;

    return p2pNode;
  }

  async connect(customProvider: ethers.providers.Provider) {
    this.signer.connect(customProvider);
  }
}
