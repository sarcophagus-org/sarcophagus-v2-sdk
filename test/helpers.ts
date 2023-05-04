import { ethers } from "ethers";

export function setupTestProvider(): ethers.providers.JsonRpcProvider {
    // Create a real provider for testing
    const testProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    // Create a mock signer
    const mockSigner = {
        getAddress: jest.fn(),
        provider: testProvider,
        // Add more mock methods and properties as needed for your tests
    } as unknown as ethers.providers.JsonRpcSigner;

    // Mock the provider's getSigner method
    jest.spyOn(testProvider, 'getSigner').mockImplementation(() => mockSigner);
    return testProvider;
}