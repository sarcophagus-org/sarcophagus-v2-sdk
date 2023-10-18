import { BigNumber } from 'ethers';

export enum SarcophagusFilter {
  recipient,
  embalmer,
}

/**
 * The state of a Sarcophagus.
 */
export enum SarcophagusState {
  /** The Sarcophagus has not yet been created */
  DoesNotExist = 'does_not_exist',

  /** The Sarcophagus has been created but is not yet due to be resurrected */
  Active = 'active',

  /** The Sarcophagus is within the grace period for archaeologists to publish their private keys. It cannot be claimed or cleaned at this state. */
  Resurrecting = 'resurrecting',

  /** The Sarcophagus has been resurrected. At least the threshold number of archaeologists required to resurrect it have published their private keys. These can be used the decrypt the outer layer of the Sarcophagus payload. */
  Resurrected = 'resurrected',

  /** The Sarcophagus has been buried by its embalmer. It can no longer be resurrected. */
  Buried = 'buried',

  /** The Sarcophagus has been cleaned -- locked bonds of archaeologists that failed to publish their private keys during the grace period of resurrection have been reclaimed. */
  Cleaned = 'cleaned',

  /** The Sarcophagus has been compromised. */
  Accused = 'accused',

  /** Less than the threshold number of archaeologists required to resurrect this Sarcophagus published their private keys in time. It can no longer be resurrected and may be cleaned (see `Cleaned` state). */
  Failed = 'failed',

  /** The Sarcophagus has been resurrected, but since not ALL archaeologists cursed on it published their private keys it time, it has also been cleaned (see `Cleaned` state). */
  CleanedResurrected = 'cleaned_resurrected',

  /** Less than the threshold number of archaeologists required to resurrect this Sarcophagus published their private keys in time. It can no longer be resurrected and has been cleaned (see `Cleaned` state). */
  CleanedFailed = 'cleaned_failed',
}

/**
 * The response from the Sarcophagus contract's `getSarcophagus` function.
 */
export interface SarcophagusResponseContract {
  /** The time after which the Sarcophagus can be resurrected */
  resurrectionTime: BigNumber;

  /** Whether the Sarcophagus has has more than the threshold of archaeologists successfully accused of leaking their private key */
  isCompromised: boolean;

  /** Whether the Sarcophagus has been cleaned */
  isCleaned: boolean;

  /** The name of the sarcophagus */
  name: string;

  /** The least number of archaeologists required to resurrect the Sarcophagus */
  threshold: number;

  /**
   * The cursed bond percentage at the time of this Sarcophagus' creation.
   * Used to determine how much free bond archaeologists must lock for this Sarcophagus.
   **/
  cursedBondPercentage: number;

  /** The maximum amount of time in the future that the Sarcophagus can be rewrapped for */
  maximumRewrapInterval: BigNumber;

  /** The Arweave transaction ID of the Sarcophagus' payload data */
  arweaveTxId: string;

  /** The address of the embalmer who created the Sarcophagus */
  embalmerAddress: string;

  /** The address of the recipient of the sarcophagus */
  recipientAddress: string;

  /** The addresses of the archaeologists who have been selected to share in bearing responsibitily for the Sarcophagus */
  archaeologistAddresses: string[];

  /** The number of archaeologists who have published their private key */
  publishedPrivateKeyCount: number;

  /** Whether the Sarcophagus has locked bond */
  hasLockedBond: boolean;

  /** The time at which the Sarcophagus was last rewrapped */
  previousRewrapTime: BigNumber;
}

/**
 * A rewrap of a Sarcophagus.
 */
export interface SarcophagusRewrap {
  /** Timestamp at which rewrap occurred */
  rewrapTimestamp: number;
  /** Amount of SARCO paid by embalmer to execute this rewrap */
  diggingFeesPaid: BigNumber;
  /** Protocol fees paid by embalmer to execute this rewrap */
  protocolFeesPaid: BigNumber;
}

/**
 * A published private key by an archaeologist
 */
export interface PrivateKeyPublish {
  privateKey: string;
  archaeologist: string;
}

/**
 * A Sarcophagus object returned by the Sarcophagus API.
 */
export type SarcophagusData = SarcophagusResponseContract & {
  id: string;
  state: SarcophagusState;
};

/**
 * A Sarcophagus object returned by the Sarcophagus API.
 * Includes the rewrap history and published archaeologist keys.
 * Used for the Sarcophagus details page.
 */
export type SarcophagusDetails = SarcophagusData & {
  rewraps: SarcophagusRewrap[];
  publishedKeys: PrivateKeyPublish[];
};

/**
 * Counts of active and inactive Sarcophagi.
 */
export interface SarcoCounts {
  activeSarcophagi: number;
  inactiveSarcophagi: number;
}
