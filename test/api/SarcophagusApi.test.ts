import { ethers } from 'ethers';
import { SarcophagusApi } from '../../src/SarcophagusApi';
import { SarcoWebIrys } from '../../src/SarcoWebIrys';
import { SarcoNetworkConfig } from '../../src/types';
import Arweave from 'arweave';

const signer = ethers.Wallet.createRandom({});
jest.mock('ethers');
jest.mock('@sarcophagus-org/sarcophagus-v2-contracts');
jest.mock('../../src/SarcoWebIrys');

describe('Api', () => {
  describe('Api Constructor', () => {
    test('should initialize with a contract address, signer, and url string', () => {
      const api = new SarcophagusApi(
        '0x0',
        signer,
        { subgraphUrl: 'subgraph/url/test' } as SarcoNetworkConfig,
        {} as SarcoWebIrys,
        {} as Arweave
      );
      expect(api).toBeDefined();
    });

    test('should have an embalmerFacet instance', () => {
      const api = new SarcophagusApi(
        '0x0',
        signer,
        { subgraphUrl: 'subgraph/url/test' } as SarcoNetworkConfig,
        {} as SarcoWebIrys,
        {} as Arweave
      );
      expect(api['embalmerFacet']).toBeDefined();
    });

    test('should set its subgraph url', () => {
      const api = new SarcophagusApi(
        '0x0',
        signer,
        { subgraphUrl: 'subgraph/url/test' } as SarcoNetworkConfig,
        {} as SarcoWebIrys,
        {} as Arweave
      );
      expect(api['subgraphUrl']).toEqual('subgraph/url/test');
    });
  });
});
