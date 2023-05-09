import { ethers } from 'ethers';
import { Api } from '../src/Api';
import { SarcoClient } from '../src/SarcoClient';
import * as safeContractCallModule from '../src/helpers/safeContractCall';
import {
  ArchaeologistSettings,
  SarcophagusSettings,
  archaeologistSettingsArraySchema,
  sarcophagusSettingsSchema,
} from '../src/helpers/validation';

const createSafeContractCallMock = () => {
  const mock = jest.fn();
  jest.spyOn(safeContractCallModule, 'safeContractCall').mockImplementation(mock);
  return mock;
};

const mockSafeContractCall = createSafeContractCallMock();

const signer = ethers.Wallet.createRandom({});
const sarcoClient = new SarcoClient({ signer });

describe('Api', () => {
  describe('Api Constructor', () => {
    test('should initialize with a SarcoClient instance', () => {
      const api = new Api(sarcoClient);
      expect(api).toBeDefined();
    });

    test('should have an embalmerFacet instance', () => {
      const signer = ethers.Wallet.createRandom({});
      const sarcoClient = new SarcoClient({ signer });
      const api = new Api(sarcoClient);
      expect(api.embalmerFacet).toBeDefined();
    });
  });

  describe.only('createSarcophagus', () => {
    const api = new Api(sarcoClient);

    beforeEach(() => {
      mockSafeContractCall.mockClear();
    });

    test('should call safeContractCall with the correct arguments', async () => {
      const sarcoId = 'test-id';
      const sarcophagusSettings: SarcophagusSettings = {
        name: 'Test Sarcophagus',
        recipientAddress: '0x0123456789012345678901234567890123456789',
        creationTime: Date.now(),
        resurrectionTime: Date.now() + 60 * 60 * 1000, // 1 hour later
        threshold: 2,
        maximumRewrapInterval: 60 * 60 * 1000, // 1 hour
        maximumResurrectionTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week later
      };

      const selectedArchaeologists: ArchaeologistSettings[] = [
        {
          publicKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
          archAddress: '0x0123456789012345678901234567890123456789',
          diggingFeePerSecond: ethers.BigNumber.from(1),
          curseFee: ethers.BigNumber.from(10),
          v: 27,
          r: '0x0123456789012345678901234567890123456789012345678901234567890123',
          s: '0x0123456789012345678901234567890123456789012345678901234567890123',
        },
        {
          publicKey: '0x0987654321098765432109876543210987654321098765432109876543210987',
          archAddress: '0x9876543210987654321098765432109876543210',
          diggingFeePerSecond: ethers.BigNumber.from(2),
          curseFee: ethers.BigNumber.from(20),
          v: 28,
          r: '0x0987654321098765432109876543210987654321098765432109876543210987',
          s: '0x0987654321098765432109876543210987654321098765432109876543210987',
        },
      ];

      const arweaveTxId = 'test-tx-id';

      const mockTransactionResponse = { hash: '0x123' } as ethers.providers.TransactionResponse;
      mockSafeContractCall.mockImplementation(() => Promise.resolve(mockTransactionResponse));

      const result = await api.createSarcophagus(
        sarcoId,
        sarcophagusSettings,
        selectedArchaeologists,
        arweaveTxId
      );

      expect(mockSafeContractCall).toHaveBeenCalledWith(
        api.embalmerFacet,
        'createSarcophagus',
        [sarcoId, sarcophagusSettings, selectedArchaeologists, arweaveTxId],
        {}
      );
      expect(result).toBe(mockTransactionResponse);
    });

    // Add more tests for the createSarcophagus function behavior
  });
});
