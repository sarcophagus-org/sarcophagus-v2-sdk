export enum RecoverPublicKeyErrorStatus {
  INVALID_ADDRESS = 1,
  CANNOT_RECOVER,
  ERROR,
}

export interface RecoverPublicKeyResponse {
  error?: RecoverPublicKeyErrorStatus;
  message?: string;
  publicKey?: string;
}
