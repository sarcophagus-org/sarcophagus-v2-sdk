import { ethers } from 'ethers';
import { SarcophagusApi } from '../../src/SarcophagusApi';
import { sarcoId } from './test-data';
import { mockSafeContractCall } from './test-utils';
import { SarcoWebIrys } from '../../src/SarcoWebIrys';
import { SarcoNetworkConfig } from '../../src/types';
import Arweave from 'arweave';

jest.spyOn(ethers, 'Contract').mockImplementation();
jest.mock('@sarcophagus-org/sarcophagus-v2-contracts');
jest.mock('../../src/SarcoWebIrys');

const signer = ethers.Wallet.createRandom({});
const api = new SarcophagusApi('0x0', signer, {} as SarcoNetworkConfig, {} as SarcoWebIrys, {} as Arweave);

beforeEach(() => {
  mockSafeContractCall.mockClear();
});

describe('burySarcophagus', () => {
  beforeEach(() => {
    mockSafeContractCall.mockClear();
  });

  test('should call safeContractCall with the correct arguments', async () => {
    const mockTransactionResponse = { hash: '0x123' } as ethers.providers.TransactionResponse;
    mockSafeContractCall.mockImplementation(() => Promise.resolve(mockTransactionResponse));

    const result = await api.burySarcophagus(sarcoId);

    expect(mockSafeContractCall).toHaveBeenCalledWith(api['embalmerFacet'], 'burySarcophagus', [sarcoId], {});
    expect(result).toBe(mockTransactionResponse);
  });
});
