import { ethers } from 'ethers';
import { Api } from '../../src/Api';
import { sarcoId } from './test-data';
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
