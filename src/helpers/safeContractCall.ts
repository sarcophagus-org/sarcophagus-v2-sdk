import { Contract, ethers } from 'ethers';

export async function safeContractCall(
  contract: Contract,
  methodName: string,
  args: any[],
  options?: ethers.providers.TransactionRequest
): Promise<ethers.providers.TransactionResponse> {
  try {
    const method = contract[methodName];
    if (!method) {
      throw new Error(`Method "${methodName}" not found on the contract`);
    }

    // Check if the transaction will succeed using callStatic
    await method.callStatic(...args);

    // Proceed with the actual transaction if callStatic succeeds
    const transactionResponse = await method(...args, options);
    return transactionResponse;
  } catch (error) {
    throw error;
  }
}
