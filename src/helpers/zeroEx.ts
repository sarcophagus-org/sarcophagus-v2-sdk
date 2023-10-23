import axios from 'axios';
import qs from 'qs';
import { SarcoNetworkConfig } from 'types';

export interface ZeroExQuoteParams {
  /** The token to exchange */
  sellToken: string;
  /** The token to receive */
  buyToken: string;
  /** The amount of `sellToken`s to sell */
  sellAmount?: string;
  /** The amount of `buyToken`s to buy */
  buyAmount?: string;
}

/**
 * ZeroEx Quote API response
 */
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

/**
 * ZeroEx API helper
 *
 * @param networkConfig - Context Network configuration
 */
export class ZeroEx {
  networkConfig: SarcoNetworkConfig;
  headers: { '0x-api-key'?: string };

  constructor(networkConfig: SarcoNetworkConfig) {
    this.networkConfig = networkConfig;
    this.headers = { '0x-api-key': this.networkConfig.zeroExApiKey };
  }

  public sellToken(): string {
    return this.networkConfig.zeroExSellToken;
  }

  /**
   * Get a quote from the 0x API
   *
   * @param params - Quote parameters
   */
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
