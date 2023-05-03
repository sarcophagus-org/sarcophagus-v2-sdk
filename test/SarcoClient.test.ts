import { ethers } from 'ethers';
import { SarcoClient } from '../src';

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

// Example test for the SarcophagusSDK
describe('SarcophagusSDK', () => {
  test('constructor should initialize with a signer', () => {
    const signer = new ethers.Wallet(
      '0x0123456789012345678901234567890123456789012345678901234567890123'
    );
    const sarco = new SarcoClient({ signer });
    expect(sarco).toBeDefined();
  });

  test('constructor should initialize with a private key', () => {
    const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    const sarco = new SarcoClient({ privateKey, provider: testProvider });
    expect(sarco).toBeDefined();
  });

  test('constructor should initialize with a mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const sarco = new SarcoClient({ mnemonic, provider: testProvider });
    expect(sarco).toBeDefined();
  });
});
