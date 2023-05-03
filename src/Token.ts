import { ERC20, SarcoTokenMock__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { safeContractCall } from './helpers/safeContractCall';
import { Address, CallOptions } from './types';

// Temporary
// TODO: Get this from the contracts package
const sarcoTokenAddress = '0x4633b43990b41B57b3678c6F3Ac35bA75C3D8436';
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';

export class Token {
  sarcoClient: SarcoClient;
  sarcoToken: ERC20;

  constructor(sarcoClient: SarcoClient) {
    this.sarcoClient = sarcoClient;
    this.sarcoToken = new ethers.Contract(
      sarcoTokenAddress,
      SarcoTokenMock__factory.abi,
      this.sarcoClient.signer
    );
  }

  async approve(amount: BigNumber, options: CallOptions = {}) {
    return await safeContractCall(
      this.sarcoToken,
      'approve',
      [goerliDiamondAddress, amount],
      options
    );
  }

  async allowance(owner: Address): Promise<BigNumber> {
    try {
      return await this.sarcoToken.allowance(owner, goerliDiamondAddress);
    } catch (err) {
      const error = err as Error;
      console.error(`Error while getting allowance: ${error.message}`);
      throw error;
    }
  }
}
