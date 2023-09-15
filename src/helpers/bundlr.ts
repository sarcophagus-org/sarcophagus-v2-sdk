import { ethers } from 'ethers';

export const sponsoredBundlrProvider = (signerPublicKey: string, signerEndpoint: string) => {
  const signerPublicKeyHex = Buffer.from(signerPublicKey, 'hex');
  return {
    getPublicKey: async () => {
      return signerPublicKeyHex;
    },
    getSigner: () => {
      return {
        publicKey: signerPublicKeyHex,
        getAddress: () => signerPublicKeyHex.toString(),
        _signTypedData: async (
          _domain: never,
          _types: never,
          message: { address: string; 'Transaction hash': Uint8Array }
        ) => {
          let messageData = Buffer.from(message['Transaction hash']).toString('hex');
          const res = await fetch(`${signerEndpoint}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ messageData }),
          });
          const { signature } = await res.json();
          const bSig = Buffer.from(signature, 'hex');
          // pad & convert so it's in the format the signer expects to have to convert from.
          const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString('hex');
          return pad;
        },
      };
    },
    _ready: () => {},
  } as unknown as ethers.providers.Web3Provider;
};
