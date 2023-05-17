import { ethers } from 'ethers';
import { Api } from '../../src/Api';

const signer = ethers.Wallet.createRandom({});

describe('Api', () => {
  describe('Api Constructor', () => {
    test('should initialize with a contract address, signer, and url string', () => {
      const api = new Api(signer.address, signer, 'subgraph/url/test');
      expect(api).toBeDefined();
    });
  });
});
