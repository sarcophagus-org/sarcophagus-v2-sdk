import { BigNumber } from 'ethers';
import { PeerId } from '@libp2p/interface-peer-id';
import { Connection } from '@libp2p/interface-connection';

export enum ArchaeologistExceptionCode {
  CONNECTION_EXCEPTION = 'connection_exception',
  STREAM_EXCEPTION = 'stream_exception',
  DECLINED_SIGNATURE = 'declined_signature',
}

export interface ArchaeologistException {
  code: ArchaeologistExceptionCode;
  message: string;
}

/**
 * Archaeologist profile from the Sarcophagus contracts.
 * Contained in the ArchaeologistData object returned by the SarcoClient.
 **/
export interface ArchaeologistProfile {
  accusals: BigNumber;
  archAddress: string;
  failures: BigNumber;
  freeBond: BigNumber;
  /** The maximum length of time, in seconds, that the archaeologist will agree to extend a Sarcophagus resurrection time for. */
  maximumRewrapInterval: BigNumber;
  /** The time, in seconds since epoch, beyond which the archaeologist will no longer agree to be cursed to a Sarcophagus. */
  maximumResurrectionTime: BigNumber;
  /** The fee, in wei per second, that the archaeologist will be charge for being cursed on a Sarcophagus. */
  minimumDiggingFeePerSecond: BigNumber;
  /** ID to connect to the archaeologist with */
  peerId: string;
  successes: BigNumber;
  /** The one-time fee, in wei, that the archaeologist will charge for being cursed on a Sarcophagus. */
  curseFee: BigNumber;
}

/**
 * Archaeologist data stored in the SarcoClient.
 * This data is used to determine which archaeologists are eligible for a curse.
 */
export interface ArchaeologistData {
  /**
   * The archaeologist's unique public key on a Sarcophagus. Matches the private key that will be used to resurrect.
   * Set after successful negotiation.
   **/
  publicKey?: string;
  profile: ArchaeologistProfile;
  /** P2P connection to the archaeologist. Will be set after a successful dial to the archaeologist */
  connection?: Connection;
  isOnline: boolean;
  fullPeerId?: PeerId;
  /** Will be set after a successful negotiation with the archaeologist. */
  signature?: string;
  ensName?: string;
  /** Set this string to indicate that this archaeologist cannot be cursed on an intended Sarcophagus. */
  ineligibleReason?: string;
  /** If this is not undefined, indicates that dialling or negotiation on this archaeologist ran into an exception. */
  exception?: ArchaeologistException;
}

/** Error code of negotiation failure */
export enum SarcophagusValidationError {
  UNKNOWN_ERROR,
  MAX_REWRAP_INTERVAL_TOO_LARGE,
  DIGGING_FEE_TOO_LOW,
  INVALID_TIMESTAMP,
  MAX_RESURRECTION_TIME_TOO_LARGE,
  CURSE_FEE_TOO_LOW,
}

/**
 * Archaeologist curse data on a particular Sarcophagus.
 */
export interface SarcophagusArchaeologist {
  diggingFeePerSecond: BigNumber;
  curseFee: BigNumber;
  isAccused: boolean;
  publicKey: string;
  privateKey: string;
}

/**
 * The encrypted shard assigned to an Archaeologist.
 */
export interface ArchaeologistEncryptedShard {
  publicKey: string;
  encryptedShard: string;
}

/**
 * The parameters used to negotiate a curse with an archaeologist.
 * These parameters are sent to the archaeologist, and the archaeologist signs them, agreeing to be cursed on these terms,
 * or else declines to sign.
 */
export interface ArchaeologistCurseNegotiationParams {
  /** Proposed maximum rewrap interval for all archaeologists to be cursed on the Sarcophagus. */
  maxRewrapInterval: number;
  /** Proposed maximum time beyond which the Sarcophagus cannot be further rewrapped. */
  maximumResurrectionTime: number;
  /** Proposed fee, in wei per second, that the archaeologist will be paid for being cursed to the Sarcophagus. */
  diggingFeePerSecond: string;
  /** Proposed one-time fee, in wei, that the archaeologist will be paid for being cursed on the Sarcophagus. */
  curseFee: string;
  /** The agreed timestamp, in milliseconds since epoch, at which negotiation happened. Will be used as start time for the curse. */
  timestamp: number;
}

export interface ArchaeologistNegotiationError {
  code: SarcophagusValidationError;
  message: string;
}

/**
 * The response from an archaeologist after they have signed the `ArchaeologistCurseNegotiationParams`.
 */
export interface ArchaeologistNegotiationResponse {
  /**
   * The archaeologist's unique public key on a Sarcophagus. Matches the private key that will be used to resurrect.
   * Set if negotiation is successful.
   **/
  publicKey: string;
  /** The archaeologist's signature indicating approval on the ArchaeologistCurseNegotiationParams. */
  signature: string;
  /** If this is not undefined, indicates that the archaeologist declined to sign for some reason. See `ArchaeologistNegotiationError`. */
  error?: ArchaeologistNegotiationError;
}

/**
 * The result of a negotiation with an archaeologist.
 * This is the final result of a negotiation sent back to the initiator of negotiation, and is used to determine
 * whether the archaeologist agreed to be cursed on a Sarcophagus.
 *
 * If the archaeologist is eligible, `publicKey` and `signature` will be set.
 *
 * If the archaeologist declined to sign, could not be reached, or ran into some other problem, the `exception` will be set.
 */
export interface ArchaeologistNegotiationResult {
  peerId: string;
  publicKey?: string;
  signature?: string;
  exception?: ArchaeologistException;
}
