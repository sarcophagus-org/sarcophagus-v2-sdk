import { EmbalmerFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { Signer, ethers } from 'ethers';

// Temporary
// TODO: Get this from the contracts package
const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';

export interface CreateSarcophagusOptions {
  ignoreSafeCall?: boolean;
}

export function Api<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    signer: Signer;

    constructor(...args: any[]) {
      super(...args);
      this.signer = args[0]; // Assuming the signer is the first argument
    }

    async createSarcophagus(
      sarcoId: string,
      name: string,
      maximumRewrapInterval: number,
      maximumResurrectionTime: number,
      recipientAddress: string,
      resurrectionTime: number,
      threshold: number,
      creationTime: number,
      selectedArchaeologists: {
        publicKey: Uint8Array;
        archAddress: string;
        diggingFeePerSecond: number;
        curseFee: number;
        v: number;
        r: string;
        s: string;
      }[],
      arweaveTxId: string,
      options: CreateSarcophagusOptions = {}
    ): Promise<ethers.providers.TransactionResponse> {
      const contract = new ethers.Contract(
        goerliDiamondAddress,
        EmbalmerFacet__factory.abi,
        this.signer
      );

      const methodName = 'createSarcophagus';
      const args = [
        sarcoId,
        {
          name,
          maximumRewrapInterval,
          maximumResurrectionTime,
          recipientAddress,
          resurrectionTime,
          threshold,
          creationTime,
        },
        selectedArchaeologists,
        arweaveTxId,
      ];

      const useSafeCall = options.ignoreSafeCall !== undefined ? options.ignoreSafeCall : true;

      if (useSafeCall) {
        try {
          // Check if the transaction will succeed using callStatic
          await contract.callStatic[methodName](...args);

          // Proceed with the actual transaction if callStatic succeeds
          const transactionResponse = await contract[methodName](...args);
          return transactionResponse;
        } catch (err) {
          const error = err as Error;
          console.error(`Error during the safe contract call: ${error.message}`);
          throw error;
        }
      } else {
        // If useSafeCall is set to false, directly call the contract method
        const transactionResponse = await contract[methodName](...args);
        return transactionResponse;
      }
    }
  };
}
