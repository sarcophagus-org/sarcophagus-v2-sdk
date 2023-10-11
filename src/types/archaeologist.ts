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
  /** This profile's archaeologist ETH address */
  archAddress: string;

  /** Number of times this profile has leaked their private keys */
  accusals: BigNumber;

  /** Number of times this profile has failed to publish their private keys */
  failures: BigNumber;

  /** Number of times this profile has successfully published their private keys on time */
  successes: BigNumber;

  /** How much free bond this profile currently has. This value needs to be more than the fee due them in order to be eligible to be cursed on any new Sarcophagus. */
  freeBond: BigNumber;

  /** The maximum length of time, in seconds, that the archaeologist will agree to extend a Sarcophagus resurrection time for. */
  maximumRewrapInterval: BigNumber;

  /** The time, in seconds since epoch, beyond which the archaeologist will no longer agree to be cursed to a Sarcophagus. */
  maximumResurrectionTime: BigNumber;

  /** The fee, in SARCO wei per second, that the archaeologist will be charge for being cursed on a Sarcophagus. */
  minimumDiggingFeePerSecond: BigNumber;

  /** ID to connect to the archaeologist with using P2P */
  peerId: string;

  /** The one-time fee, in SARCO wei, that the archaeologist will charge for being cursed on a Sarcophagus. */
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

/**
 * Indicates what kind of error occured if Archaologist negotiation fails during the step
 * requesting selected archaeologists to sign off on Sarcophagus parameters.
 **/
export enum SarcophagusValidationError {
  /** The archaeologist's signature on the Sarcophagus parameters was invalid for an unknown reason. Please contact the devlopers as this is likely a bug. */
  UNKNOWN_ERROR = 'unknown_error',
  /** The proposed maximum rewrap interval is larger than the archaeologist can accept. */
  MAX_REWRAP_INTERVAL_TOO_LARGE = 'max_rewrap_interval_too_large',
  /** The proposed digging fee is smaller than the archaeologist will accept. */
  DIGGING_FEE_TOO_LOW = 'digging_fee_too_low',
  /** The proposed maximum resurrection time is larger than the archaeologist can accept. */
  MAX_RESURRECTION_TIME_TOO_LARGE = 'max_resurrection_time_too_large',
  /** The proposed timestamp is invalid. This is most likely because too much time has passed between this timestamp and time actual time a signature was requested. */
  INVALID_TIMESTAMP = 'invalid_timestamp',
  /** The proposed curse fee is smaller than the archaeologist will accept. */
  CURSE_FEE_TOO_LOW = 'curse_fee_too_low',
}

/**
 * Archaeologist curse data on a particular Sarcophagus.
 */
export interface SarcophagusArchaeologist {
  /** The archaeologist's fee per second during the Sarcophagus' lifetime */
  diggingFeePerSecond: BigNumber;
  /** The archaeologist's one-time fee for being cursed on the Sarcophagus */
  curseFee: BigNumber;
  /** If true, the archaeologist has leaked this Sarcophagus' private key and been successfully accused */
  isAccused: boolean;
  /** The archaeologist's unique public key on a Sarcophagus. Matches the private key that will be used to resurrect. */
  publicKey: string;
  /** The archaeologist's unique private key on a Sarcophagus. This will be used to resurrect and should only be published when the Sarcophagus is to be resurrected. */
  privateKey: string;
}

/**
 * The encrypted shard assigned to an Archaeologist.
 */
export interface ArchaeologistEncryptedShard {
  /**
   * The archaeologist's unique public key on a Sarcophagus. Matches the private key that will be used to resurrect.
   */
  publicKey: string;
  /** The encrypted shard assigned to the archaeologist. */
  encryptedShard: string;
}

/**
 * The parameters used to negotiate a curse with an archaeologist.
 * These parameters are sent to the archaeologist, and the archaeologist signs them, agreeing to be cursed on these terms,
 * otherwise it declines to sign.
 */
export interface ArchaeologistCurseNegotiationParams {
  /** Proposed maximum rewrap interval for all archaeologists to be cursed on the Sarcophagus. */
  maxRewrapInterval: number;
  /** Proposed maximum time beyond which the Sarcophagus cannot be further rewrapped. */
  maximumResurrectionTime: number;
  /** Proposed fee, in SARCO wei per second, that the archaeologist will be paid for being cursed to the Sarcophagus. */
  diggingFeePerSecond: string;
  /** Proposed one-time fee, in SARCO wei, that the archaeologist will be paid for being cursed on the Sarcophagus. */
  curseFee: string;
  /** The agreed timestamp, in milliseconds since epoch, at which negotiation happened. Will be used as start time for the curse. */
  timestamp: number;
}

/**
 * The error that occurs if an archaeologist declines to sign the `ArchaeologistCurseNegotiationParams`.
 * This is sent back to the initiator of negotiation.
 **/
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
  /**
   * The public key matching the private key to be safeguarded by the archaeoogist.
   * If set, the archaeologist agreed to the negotiation params
   **/
  publicKey?: string;

  /**
   * The signature to be provided to the contract when creating the Sarcophagus.
   * If set, the archaeologist agreed to the negotiation params
   **/
  signature?: string;
  /** If set, indicates that dialling or negotiation on this archaeologist ran into an exception. */
  exception?: ArchaeologistException;
}
