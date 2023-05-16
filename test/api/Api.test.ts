import { ethers } from 'ethers';
import { Api } from '../../src/Api';
import { SarcoClient } from '../../src/SarcoClient';

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
});
