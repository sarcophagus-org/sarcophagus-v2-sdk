import { ethers } from 'ethers';
// import { ArchaeologistApi } from '../../src/ArchaeologistApi';
import { Libp2p } from 'libp2p';

const signer = ethers.Wallet.createRandom({});

describe('ArchaeologistApi', () => {
  describe('ArchaeologistApi Constructor', () => {
    test('stub', () => {});
    // test('should initialize with a contract address, signer, and url string', () => {
    //   const archApi = new ArchaeologistApi(signer.address, signer, 'subgraph/url/test', {} as Libp2p);
    //   expect(archApi).toBeDefined();
    // });

    // test('should have an viewStateFacet instance', () => {
    //   const archApi = new ArchaeologistApi(signer.address, signer, 'subgraph/url/test', {} as Libp2p);
    //   expect(archApi['viewStateFacet']).toBeDefined();
    // });

    // test('should have a libp2p instance', () => {
    //   const archApi = new ArchaeologistApi(signer.address, signer, 'subgraph/url/test', {} as Libp2p);
    //   expect(archApi['p2pNode']).toBeDefined();
    // });

    // test('should set its subgraph url', () => {
    //   const archApi = new ArchaeologistApi(signer.address, signer, 'subgraph/url/test', {} as Libp2p);
    //   expect(archApi['subgraphUrl']).toEqual('subgraph/url/test');
    // });

    // test('should set its signer', () => {
    //   const archApi = new ArchaeologistApi(signer.address, signer, 'subgraph/url/test', {} as Libp2p);
    //   expect(archApi['signer']).toStrictEqual(signer);
    // });
  });
});
