import { ERC20, SarcoTokenMock__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions } from './types';

/**
 * Token class for interacting with the SARCO token.
 */
export class Token {
  private diamondDeployAddress: string;
  private sarcoToken: ERC20;

  constructor(sarcoTokenAddress: string, diamondDeployAddress: string, signer: ethers.Signer) {
    this.diamondDeployAddress = diamondDeployAddress;
    this.sarcoToken = new ethers.Contract(sarcoTokenAddress, SarcoTokenMock__factory.abi, signer);
  }

  /**
   * Approve the Sarcophagus contracts to spend the given amount of your SARCO tokens.
   * @param amount the amount of SARCO tokens to approve
   * @param options options for the contract call
   * @returns
   */
  async approve(amount: BigNumber, options: CallOptions = {}) {
    return await safeContractCall(this.sarcoToken, 'approve', [this.diamondDeployAddress, amount], options);
  }

  /**
   * Get the spending allowance given to the Sarcophagus contracts by the given `owner`'s SARCO tokens.
   * @param owner address of the owner of the SARCO tokens
   * @returns the spending allowance allowed by the owner
   */
  async allowance(owner: string): Promise<BigNumber> {
    try {
      return await this.sarcoToken.allowance(owner, this.diamondDeployAddress);
    } catch (err) {
      const error = err as Error;
      console.error(`Error while getting allowance: ${error.message}`);
      throw error;
    }
  }
}
