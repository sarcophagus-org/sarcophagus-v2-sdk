import { ethers } from 'ethers';
import { ArchaeologistEncryptedShard } from '../types/archaeologist';
import { encrypt } from './encryption';
import { ArweaveFileMetadata } from '../types/arweave';

export const maxSarcophagusNameLength = 60;
export const maxFileSize = 400_000_000;
export const chunkedUploaderFileSize = 50_000_000;
export const bundlrBalanceDecimals = 8;
export const uploadPriceDecimals = 8;
export const minimumResurrection = 30_000;
export const monthSeconds = 2628288;
export const maxTotalArchaeologists = 255; // limited by the shamir secret sharing algorithm
export const discordBuildersLink = 'https://discord.com/channels/839548879216181309/938467660595879986';

export async function encryptShardsWithArchaeologistPublicKeys(
  publicKeys: string[],
  keyShares: Uint8Array[]
): Promise<ArchaeologistEncryptedShard[]> {
  return Promise.all(
    publicKeys.map(async (publicKey, i) => ({
      publicKey,
      encryptedShard: ethers.utils.hexlify(await encrypt(publicKey, Buffer.from(keyShares[i]))),
    }))
  );
}

export async function encryptShardsWithRecipientPublicKey(
  publicKey: string,
  keyShares: Uint8Array[]
): Promise<Uint8Array[]> {
  return Promise.all(
    keyShares.map(async (share, i) => {
      return encrypt(publicKey, Buffer.from(keyShares[i]));
    })
  );
}

export async function encryptMetadataFields(
  publicKey: string,
  metadata: ArweaveFileMetadata
): Promise<ArweaveFileMetadata> {
  const encryptedFilename = await encrypt(publicKey, Buffer.from(metadata.fileName));
  const encryptedFileType = await encrypt(publicKey, Buffer.from(metadata.type));

  return {
    fileName: encryptedFilename.toString('binary'),
    type: encryptedFileType.toString('binary'),
  };
}
