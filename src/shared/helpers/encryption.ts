import { decrypt as eciesDecrypt, encrypt as eciesEncrypt } from 'ecies-geth';
import { BigNumber, ethers, Signature, Signer } from 'ethers';
import moment from 'moment';

export async function decrypt(privateKey: string, payload: Buffer): Promise<Buffer> {
  return eciesDecrypt(Buffer.from(ethers.utils.arrayify(privateKey)), payload);
}
