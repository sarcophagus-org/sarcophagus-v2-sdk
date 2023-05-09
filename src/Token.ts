import { ERC20, SarcoTokenMock__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { safeContractCall } from './helpers/safeContractCall';
import { CallOptions } from './types';
import { goerliNetworkConfig } from './networkConfig/index';

export class Token {
  sarcoClient: SarcoClient;
  sarcoToken: ERC20;

  constructor(sarcoClient: SarcoClient) {
    this.sarcoClient = sarcoClient;
    this.sarcoToken = new ethers.Contract(
      goerliNetworkConfig.sarcoTokenAddress,
      SarcoTokenMock__factory.abi,
      this.sarcoClient.signer
    );
  }

  async approve(amount: BigNumber, options: CallOptions = {}) {
    return await safeContractCall(
      this.sarcoToken,
      'approve',
      [goerliNetworkConfig.diamondDeployAddress, amount],
      options
    );
  }

  async allowance(owner: string): Promise<BigNumber> {
    try {
      return await this.sarcoToken.allowance(owner, goerliNetworkConfig.diamondDeployAddress);
    } catch (err) {
      const error = err as Error;
      console.error(`Error while getting allowance: ${error.message}`);
      throw error;
    }
  }
}
