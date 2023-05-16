import { BigNumber } from 'ethers';
import { PeerId } from '@libp2p/interface-peer-id';
import { Connection } from '@libp2p/interface-connection';
import { Address } from '../types';

export enum ArchaeologistExceptionCode {
  CONNECTION_EXCEPTION = 'connection_exception',
  STREAM_EXCEPTION = 'stream_exception',
  DECLINED_SIGNATURE = 'declined_signature',
}

export interface ArchaeologistException {
  code: ArchaeologistExceptionCode;
  message: string;
}

export interface ArchaeologistProfile {
  accusals: BigNumber;
  archAddress: Address;
  failures: BigNumber;
  freeBond: BigNumber;
  maximumRewrapInterval: BigNumber;
  maximumResurrectionTime: BigNumber;
  minimumDiggingFeePerSecond: BigNumber;
  peerId: string;
  successes: BigNumber;
  curseFee: BigNumber;
}

export interface ArchaeologistData {
  publicKey?: string;
  profile: ArchaeologistProfile;
  connection?: Connection;
  isOnline: boolean;
  fullPeerId?: PeerId;
  signature?: string;
  ensName?: string;
  hiddenReason?: string;
  exception?: ArchaeologistException;
}

export enum SarcophagusValidationError {
  UNKNOWN_ERROR,
  MAX_REWRAP_INTERVAL_TOO_LARGE,
  DIGGING_FEE_TOO_LOW,
  INVALID_TIMESTAMP,
  MAX_RESURRECTION_TIME_TOO_LARGE,
  CURSE_FEE_TOO_LOW,
}

export interface SarcophagusArchaeologist {
  diggingFeePerSecond: BigNumber;
  curseFee: BigNumber;
  isAccused: boolean;
  publicKey: string;
  privateKey: string;
}

export interface ArchaeologistEncryptedShard {
  publicKey: string;
  encryptedShard: string;
}

export interface ArchaeologistSignatureNegotiationParams {
  maxRewrapInterval: number;
  maximumResurrectionTime: number;
  diggingFeePerSecond: string;
  timestamp: number;
  curseFee: string;
}

export interface ArchaeologistNegotiationResponse {
  publicKey: string;
  signature: string;
  error?: any;
  exception?: ArchaeologistException;
}

export interface ArchaeologistNegotiationResult {
  peerId: string;
  publicKey?: string;
  signature?: string;
  exception?: ArchaeologistException;
}
