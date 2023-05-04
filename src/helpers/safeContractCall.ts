import { Contract, ethers } from 'ethers';
import { CallOptions } from '../types';

/**
 * Safely calls a contract method with the provided arguments and options.
 * This function checks if the transaction will succeed using callStatic before executing it.
 * If the callStatic fails, the function will log an error and throw the error, preventing the actual transaction.
 *
 * @param {Contract} contract - An instantiated ethers.js Contract object.
 * @param {string} methodName - The name of the contract method to call.
 * @param {any[]} args - An array of arguments to pass to the contract method.
 * @param {CallOptions} options - Optional object with additional call options. Defaults to {}.
 * @property {boolean} [options.ignoreSafeCall] - If true, bypasses the safe call check using callStatic.
 *
 * @returns {Promise<ethers.providers.TransactionResponse>} - A Promise that resolves to an ethers.js TransactionResponse.
 * @throws {Error} - If an error occurs during the safe call check or the actual transaction call.
 */
export async function safeContractCall(
  contract: Contract,
  methodName: string,
  args: any[],
  options: CallOptions = {}
): Promise<ethers.providers.TransactionResponse> {
  const useSafeCall = options.ignoreSafeCall ?? true;

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
