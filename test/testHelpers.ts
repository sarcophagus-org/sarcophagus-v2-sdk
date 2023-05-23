import { ethers } from 'ethers';

export function getAddressFromPublicKey(publicKey: string) {
  if (publicKey.startsWith('0x')) {
    publicKey = publicKey.slice(2);
  }
  return ethers.utils.computeAddress('0x' + publicKey);
}
