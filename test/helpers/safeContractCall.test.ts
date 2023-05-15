import { safeContractCall } from '../../src/helpers/safeContractCall';
import { Contract, ethers } from 'ethers';

// Create a mock contract instance
const mockContractInstance = {
  callStatic: {
    exampleMethod: jest.fn(),
  },
  exampleMethod: jest.fn(),
};

// Mock the ethers.Contract class
jest.mock('ethers', () => ({
  Contract: jest.fn().mockImplementation(() => mockContractInstance),
  ethers: {
    providers: {
      TransactionResponse: jest.fn(),
    },
  },
}));

describe('safeContractCall', () => {
  let contract: any;
  let methodName: string;
  let args: any[];

  beforeEach(() => {
    // Use the mock contract instance directly
    contract = mockContractInstance;
    contract.callStatic.exampleMethod.mockReset();
    contract.exampleMethod.mockReset();
    methodName = 'exampleMethod';
    args = [1, 2, 3];
  });

  test('should call the contract method successfully', async () => {
    contract.callStatic[methodName] = jest.fn().mockResolvedValue(true);
    contract[methodName] = jest.fn().mockResolvedValue('transactionResponse');

    const result = await safeContractCall(contract, methodName, args);

    expect(result).toBe('transactionResponse');
    expect(contract.callStatic[methodName]).toHaveBeenCalledWith(...args);
    expect(contract[methodName]).toHaveBeenCalledWith(...args);
  });

  test('should throw an error if callStatic fails', async () => {
    const errorMessage = 'callStatic error';
    contract.callStatic[methodName] = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(safeContractCall(contract, methodName, args)).rejects.toThrow(errorMessage);
    expect(contract.callStatic[methodName]).toHaveBeenCalledWith(...args);
    expect(contract[methodName]).not.toHaveBeenCalled();
  });

  test('should bypass the safe call check and directly call the contract method if ignoreSafeCall is set to true', async () => {
    contract[methodName] = jest.fn().mockResolvedValue('transactionResponse');

    const result = await safeContractCall(contract, methodName, args, { ignoreSafeCall: true });

    expect(result).toBe('transactionResponse');
    expect(contract.callStatic[methodName]).not.toHaveBeenCalled();
    expect(contract[methodName]).toHaveBeenCalledWith(...args);
  });

  test('should handle contract methods that do not require arguments', async () => {
    const noArgMethodName = 'noArgMethod';
    contract.callStatic[noArgMethodName] = jest.fn().mockResolvedValue(true);
    contract[noArgMethodName] = jest.fn().mockResolvedValue('transactionResponse');

    const result = await safeContractCall(contract, noArgMethodName, []);

    expect(result).toBe('transactionResponse');
    expect(contract.callStatic[noArgMethodName]).toHaveBeenCalled();
    expect(contract[noArgMethodName]).toHaveBeenCalled();
  });

  test('should throw an error if the actual transaction call fails', async () => {
    const errorMessage = 'transaction error';
    contract.callStatic[methodName] = jest.fn().mockResolvedValue(true);
    contract[methodName] = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(safeContractCall(contract, methodName, args)).rejects.toThrow(errorMessage);
    expect(contract.callStatic[methodName]).toHaveBeenCalledWith(...args);
    expect(contract[methodName]).toHaveBeenCalledWith(...args);
  });

  test('should throw an error if the contract method does not exist', async () => {
    const nonExistentMethod = 'nonExistentMethod';

    await expect(safeContractCall(contract, nonExistentMethod, args)).rejects.toThrow();
  });
});
