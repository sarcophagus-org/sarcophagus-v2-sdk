import { ChunkingUploader } from '@irys/sdk/build/esm/common/chunkingUploader';

export enum ArweaveTxStatus {
  PENDING,
  SUCCESS,
  FAIL,
}

export interface ArweaveFileMetadata {
  fileName: string;
  type: string;
}

export interface PayloadData {
  name: string;
  type: string;
  data: Buffer;
}

export interface UploadArweavePayloadArgs {
  /** The formatted and encrypted arweave payload to upload */
  arweavePayload: Buffer;
  /** Callback for preparation steps during upload. `step` can be displayed to end-user. */
  onStep: (step: string) => void;
  /** Callback for upload progress. */
  onUploadChunk: (chunkedUploader: ChunkingUploader, chunkedUploadProgress: number) => void;
  /** Callback for chunk upload errors. */
  onUploadChunkError: (msg: string) => void;
  /** Callback for upload completion. */
  onUploadComplete: (uploadId: string) => void;
}

export type ArweaveFilePayloadOptions = Omit<UploadArweavePayloadArgs, 'arweavePayload'> & {
  /** The file to upload. Leave undefined if using `payloadData`. */
  file?: File | undefined;
  /** The payload data to upload. Leave undefined if using `file`. */
  payloadData?: PayloadData | undefined;
  /** The private key used to encrypt the payload. */
  payloadPrivateKey?: string;
  /** The corresponding public key payload encryption key. */
  payloadPublicKey?: string;
  /** The public key of the recipient. */
  recipientPublicKey: string;
  /** The number of shares for Shamir's Secret Sharing. */
  shares: number;
  /** The threshold value for Shamir's Secret Sharing. */
  threshold: number;
  /** The archaeologists' public keys. Used to encrypt the outer layer of the split key shares. */
  archaeologistPublicKeys: string[];
};

type filePayloadArgs = 'file' | 'payloadData' | 'payloadPrivateKey' | 'payloadPublicKey' | 'shares' | 'threshold';

export type PreEncryptedPayloadOptions = Omit<ArweaveFilePayloadOptions, filePayloadArgs> & {
  /**
   * Recipient-public-key encrypted keyshares.
   *
   * As these are already inner-encrypted, only the outer layer encryption using the archaeologists' public keys will be performed.
   * */
  innerEncryptedkeyShares: Uint8Array[];
  /**
   * Pre-encrypted file payload.
   *
   * As the file is already encrypted, only the inner layer encryption using the recipient public key will be performed.
   * The responsibility of ensuring the original key used to encrypt the keyshares is safely discarded is left to the caller.
   *
   * */
  encryptedPayload: Buffer;
  encryptedPayloadMetadata: ArweaveFileMetadata;
};

type onUploadCallbacks = 'onUploadChunk' | 'onUploadChunkError' | 'onUploadComplete';

export type EncryptInnerLayerArgs = Omit<ArweaveFilePayloadOptions, onUploadCallbacks | 'archaeologistPublicKeys'>;

export type EncryptOuterLayerArgs = Omit<PreEncryptedPayloadOptions, onUploadCallbacks>;

export interface ArweaveResponse {
  metadata: ArweaveFileMetadata;

  /**
   * The double-encrypted key shares. Outer layer to be decrypted with published archaeologist private keys, then
   * inner layer decrypted with recipient private key. Plaintext shares to then be recombined using Shamir's Secret Sharing,
   * and used to decrypt the file.
   **/
  keyShares: Record<string, string>;

  /** The encrypted file */
  fileBuffer: Buffer;
}

/** Called whenever an arweave file download makes progress.
 *
 * `progress` is a number indicating completion from 0 to 1.
 * */
export type OnDownloadProgress = (progress: number) => void;
