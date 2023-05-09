import { BigNumber } from 'ethers';
import { PeerId } from '@libp2p/interface-peer-id';
import { Connection } from '@libp2p/interface-connection';

export enum ArchaeologistExceptionCode {
  CONNECTION_EXCEPTION,
  STREAM_EXCEPTION,
  DECLINED_SIGNATURE,
}


export interface ArchaeologistException {
  code: ArchaeologistExceptionCode;
  message: string;
}

export interface ArchaeologistProfile {
  accusals: BigNumber;
  archAddress: string;
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
