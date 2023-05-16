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
