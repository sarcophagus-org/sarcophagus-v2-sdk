export enum ArweaveTxStatus {
  PENDING,
  SUCCESS,
  FAIL,
}

export interface ArweaveFileMetadata {
  fileName: string;
  type: string;
}

export interface ArweaveResponse {
  metadata: ArweaveFileMetadata;
  keyShares: Record<string, string>;
  fileBuffer: Buffer;
}

export type OnDownloadProgress = (progress: number) => void;
