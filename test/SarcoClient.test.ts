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
  describe('Constructor', () => {
    test('should initialize with a signer', () => {
      const signer = new ethers.Wallet(
        '0x0123456789012345678901234567890123456789012345678901234567890123'
      );
      const sdk = new SarcoClient({ signer });
      expect(sdk).toBeDefined();
    });

    test('should initialize with a private key', () => {
      const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
      const sdk = new SarcoClient({ privateKey, provider: testProvider });
      expect(sdk).toBeDefined();
    });

    test('should initialize with a mnemonic', () => {
      const mnemonic = 'test test test test test test test test test test test junk';
      const sdk = new SarcoClient({ mnemonic, provider: testProvider });
      expect(sdk).toBeDefined();
    });

    test('throws if called without at least one required parameter', () => {
      expect(() => new SarcoClient({})).toThrowError();
    });
  });
});
