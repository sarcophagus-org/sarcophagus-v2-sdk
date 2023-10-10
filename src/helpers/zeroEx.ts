import axios from 'axios';
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
    const host = this.networkConfig.zeroExApiUrl;

    if (!host) {
      throw new Error(`0x API is unsupported on ${this.networkConfig.networkShortName}`);
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
