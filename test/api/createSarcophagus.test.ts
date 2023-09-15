import { ethers } from 'ethers';
import { ValidationError } from 'yup';
import { Api } from '../../src/Api';
import { ArchaeologistSettings } from '../../src/helpers/validation';
import { arweaveTxId, defaultArchaeologists, defaultSarcophagusSettings, sarcoId } from './test-data';
import { mockSafeContractCall } from './test-utils';
import { SarcoWebBundlr } from '../../src/SarcoWebBundlr';
import { SarcoNetworkConfig } from '../../src/types';
import Arweave from 'arweave';

jest.spyOn(ethers, 'Contract').mockImplementation();
jest.mock('@sarcophagus-org/sarcophagus-v2-contracts');
jest.mock('../../src/SarcoWebBundlr');

const signer = ethers.Wallet.createRandom({});
const api = new Api('0x0', signer, {} as SarcoNetworkConfig, {} as SarcoWebBundlr, {} as Arweave);

beforeEach(() => {
  mockSafeContractCall.mockClear();
});

describe('createSarcophagus', () => {
  test('should call safeContractCall with the correct arguments', async () => {
    const mockTransactionResponse = { hash: '0x123' } as ethers.providers.TransactionResponse;
    mockSafeContractCall.mockImplementation(() => Promise.resolve(mockTransactionResponse));

    const result = await api.createSarcophagus(sarcoId, defaultSarcophagusSettings, defaultArchaeologists, arweaveTxId);

    expect(mockSafeContractCall).toHaveBeenCalledWith(
      api['embalmerFacet'],
      'createSarcophagus',
      [sarcoId, defaultSarcophagusSettings, defaultArchaeologists, arweaveTxId],
      {}
    );
    expect(result).toBe(mockTransactionResponse);
  });

  test('should throw an error if not enough archaeologists are selected', async () => {
    const notEnoughArchaeologists = [defaultArchaeologists[0]];

    await expect(
      api.createSarcophagus(sarcoId, defaultSarcophagusSettings, notEnoughArchaeologists, arweaveTxId)
    ).rejects.toThrow('Not enough archaeologists selected');
  });

  test('should throw a validation error if sarcophagusSettings are invalid', async () => {
    const invalidSarcophagusSettings = {
      ...defaultSarcophagusSettings,
      name: '',
    };

    await expect(
      api.createSarcophagus(sarcoId, invalidSarcophagusSettings, defaultArchaeologists, arweaveTxId)
    ).rejects.toThrow(ValidationError);
  });

  test('should throw a validation error if selectedArchaeologists are invalid', async () => {
    const invalidSelectedArchaeologists: Partial<ArchaeologistSettings>[] = [
      {
        ...defaultArchaeologists[0],
        publicKey: '',
      },
    ];

    await expect(
      api.createSarcophagus(
        sarcoId,
        defaultSarcophagusSettings,
        invalidSelectedArchaeologists as ArchaeologistSettings[],
        arweaveTxId
      )
    ).rejects.toThrow(ValidationError);
  });
});
