import { ArchaeologistData } from 'types/archaeologist';

export * from './zeroEx';

/**
 * Returns the smallest maximumRewrapInterval value
 * from the profiles of the archaeologists provided
 */
export function getLowestRewrapInterval(archaeologists: ArchaeologistData[]): number {
  return Math.min(
    ...archaeologists.map(arch => {
      return Number(arch.profile.maximumRewrapInterval);
    })
  );
}

/**
 * Returns the smallest maximumResurrectionTime value
 * from the profiles of the archaeologists provided
 */
export function getLowestResurrectionTime(archaeologists: ArchaeologistData[]): number {
  return Math.min(
    ...archaeologists.map(arch => {
      return Number(arch.profile.maximumResurrectionTime);
    })
  );
}
