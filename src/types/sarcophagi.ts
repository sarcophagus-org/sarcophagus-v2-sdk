import { BigNumber } from 'ethers';

export enum SarcophagusFilter {
  recipient,
  embalmer,
}
export enum SarcophagusState {
  DoesNotExist,
  Active,
  Resurrecting,
  Resurrected,
  Buried,
  Cleaned,
  Accused,
  Failed,
  CleanedResurrected,
  CleanedFailed,
}

export interface SarcophagusResponseContract {
  resurrectionTime: BigNumber;
  isCompromised: boolean;
  isCleaned: boolean;
  name: string;
  threshold: number;
  cursedBondPercentage: number;
  maximumRewrapInterval: BigNumber;
  arweaveTxId: string;
  embalmerAddress: string;
  recipientAddress: string;
  archaeologistAddresses: string[];
  publishedPrivateKeyCount: number;
  hasLockedBond: boolean;
  previousRewrapTime: BigNumber;
}

export type SarcophagusData = SarcophagusResponseContract & { id: string; state: SarcophagusState };
