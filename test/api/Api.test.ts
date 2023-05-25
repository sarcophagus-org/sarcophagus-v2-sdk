import { ethers } from 'ethers';
import { SarcophagusApi } from '../../src/SarcophagusApi';

const signer = ethers.Wallet.createRandom({});

describe('Api', () => {
  describe('Api Constructor', () => {
    test('should initialize with a contract address, signer, and url string', () => {
      const api = new SarcophagusApi(signer.address, signer, 'subgraph/url/test');
      expect(api).toBeDefined();
    });

    test('should have an embalmerFacet instance', () => {	
      const api = new SarcophagusApi(signer.address, signer, 'subgraph/url/test');
      expect(api['embalmerFacet']).toBeDefined();	
    });

    test('should set its subgraph url', () => {	
      const api = new SarcophagusApi(signer.address, signer, 'subgraph/url/test');
      expect(api['subgraphUrl']).toEqual('subgraph/url/test');	
    });
  });
});
