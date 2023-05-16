import { ethers } from 'ethers';
import { Api } from '../../src/Api';
import { SarcoClient } from '../../src/SarcoClient';
import { sarcoId } from './test-data';
import { mockSafeContractCall } from './test-utils';

const signer = ethers.Wallet.createRandom({});
const sarcoClient = new SarcoClient({ signer });

const api = new Api(sarcoClient);

beforeEach(() => {
  mockSafeContractCall.mockClear();
});

describe('burySarcophagus', () => {
  test('should call safeContractCall with the correct arguments', async () => {
    const mockTransactionResponse = { hash: '0x123' } as ethers.providers.TransactionResponse;
    mockSafeContractCall.mockImplementation(() => Promise.resolve(mockTransactionResponse));

    const result = await api.burySarcophagus(sarcoId);

    expect(mockSafeContractCall).toHaveBeenCalledWith(
      api.embalmerFacet,
      'burySarcophagus',
      [sarcoId],
      {}
    );
    expect(result).toBe(mockTransactionResponse);
  });
});
