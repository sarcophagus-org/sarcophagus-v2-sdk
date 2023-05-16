import Bundlr from '@bundlr-network/client/build/cjs/node/bundlr';
import { ethers } from 'ethers';
import { SarcoClient } from '../src/SarcoClient';
import { getSigner } from '../src/helpers/getSigner';

// Mocks
jest.mock('../src/helpers/getSigner');
jest.mock('@bundlr-network/client/build/cjs/node/bundlr');
jest.mock('../src/Api', () => {
  // Mock class
  return {
    Api: jest.fn().mockImplementation(() => {
      return { someApiMethod: jest.fn() }; // Mock the methods as needed
    }),
  };
});

jest.mock('../src/Token', () => {
  // Mock class
  return {
    Token: jest.fn().mockImplementation(() => {
      return { someTokenMethod: jest.fn() }; // Mock the methods as needed
    }),
  };
});

const BundlrMock = Bundlr as jest.Mocked<typeof Bundlr>;

// Test setup
describe('SarcoClient', () => {
  let mockSigner: jest.Mocked<ethers.Signer>;
  let testProvider: ethers.providers.JsonRpcProvider;
  const mockGetSigner = getSigner as jest.Mock;

  beforeEach(() => {
    // Create a real provider for testing
    testProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    // Create a mock signer
    mockSigner = {
      connect: jest.fn(),
    } as unknown as jest.Mocked<ethers.Signer>;

    // Mock the getSigner function to return the mock signer
    mockGetSigner.mockReturnValue(mockSigner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with a private key', () => {
      const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
      const sarco = new SarcoClient({ privateKey, provider: testProvider });

      expect(sarco).toBeDefined();
      expect(sarco.signer).toBe(mockSigner);
      expect(BundlrMock).toHaveBeenCalledWith(
        'http://node1.bundlr.network',
        'ethereum',
        privateKey
      );
      expect(mockGetSigner).toHaveBeenCalledWith({ privateKey, provider: testProvider });
    });

    it('should throw an error if no signer, private key or mnemonic is provided', () => {
      expect(() => {
        new SarcoClient();
      }).toThrow('No private key provided');
    });
  });

  describe('connect', () => {
    it('should connect the signer with the provided provider', async () => {
      const sarco = new SarcoClient({
        privateKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
        provider: testProvider,
      });
      await sarco.connect(testProvider);

      expect(mockSigner.connect).toHaveBeenCalledWith(testProvider);
    });
  });
});
