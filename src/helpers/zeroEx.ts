import axios from 'axios';
import {
  GOERLI_CHAIN_ID,
  MAINNET_CHAIN_ID,
  POLYGON_MUMBAI_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
} from 'networkConfig';
import qs from 'qs';
import { SarcoNetworkConfig } from 'types';

export interface ZeroExQuoteParams {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
}

export interface ZeroExQuote {
  sellAmount: string;
  buyAmount: string;
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  allowanceTarget: string;
  chainId: number;
}

export class ZeroEx {
  networkConfig: SarcoNetworkConfig;
  headers: { '0x-api-key'?: string };

  constructor(networkConfig: SarcoNetworkConfig) {
    this.networkConfig = networkConfig;
    this.headers = { '0x-api-key': this.networkConfig.zeroExApiKey };
  }

  public async quote(params: ZeroExQuoteParams) {
    const chainIdToHost = new Map<number, string>([
      [MAINNET_CHAIN_ID, 'https://api.0x.org'],
      [GOERLI_CHAIN_ID, 'https://goerli.api.0x.org'],
      [SEPOLIA_CHAIN_ID, 'https://sepolia.api.0x.org'],
      [POLYGON_MUMBAI_CHAIN_ID, 'https://mumbai.api.0x.org'],
    ]);

    const host = chainIdToHost.get(this.networkConfig.chainId);

    if (!host) {
      throw new Error(`0x API is unsupported on chain id: ${this.networkConfig.chainId}`);
    }

    const response = await axios
      .get(`${host}/swap/v1/quote?${qs.stringify(params)}`, {
        headers: this.headers,
      })
      .catch(error => {
        throw new Error(`Failed to get quote: ${error.message}`);
      });

    const quote: ZeroExQuote = response.data;

    return quote;
  }
}
