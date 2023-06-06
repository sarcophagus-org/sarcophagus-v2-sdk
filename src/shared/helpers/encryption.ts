import { decrypt as eciesDecrypt, encrypt as eciesEncrypt } from 'ecies-geth';
import { ethers } from 'ethers';

/**
 * Encrypts a payload given a public key
 * @param publicKey The public key to encrypt the payload with
 * @param payload The payload to encrypt
 * @returns The encrypted payload
 */
export async function encrypt(publicKey: string, payload: Buffer): Promise<Buffer> {
  return eciesEncrypt(Buffer.from(ethers.utils.arrayify(publicKey)), payload);
}

export async function decrypt(privateKey: string, payload: Buffer): Promise<Buffer> {
  return eciesDecrypt(Buffer.from(ethers.utils.arrayify(privateKey)), payload);
}
