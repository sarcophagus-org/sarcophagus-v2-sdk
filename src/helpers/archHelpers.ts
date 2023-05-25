import { BigNumber, ethers } from 'ethers';
import { ArchaeologistData } from '../types/archaeologist';
import { formatSarco } from './misc';

// TODO: Should these be moved to the ArchaeologistApi?

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

/**
 * Returns the total digging fees owed to the archaeologist, given a resurrection time and current timestamp.
 **/
export function calculateDiggingFees(
  archaeologist: ArchaeologistData,
  resurrectionTime: number,
  timestampMs: number
): BigNumber {
  const nowSec = Math.floor(timestampMs / 1000);
  const resurrectionTimeSec = Math.floor(resurrectionTime / 1000);

  if (resurrectionTimeSec <= nowSec) {
    throw new Error(
      `${archaeologist.profile.archAddress} resurrectionTime ${resurrectionTime} must be larger than timestampMs ${timestampMs}`
    );
  }

  return archaeologist.profile.minimumDiggingFeePerSecond.mul(resurrectionTimeSec - nowSec);
}

/**
 * Returns the total projected digging fees owed to the archaeologist, given a resurrection time and current timestamp.
 *
 * @param diggingFeeRates An array of the archaeologist's digging fees per second rates
 * @param resurrectionTimestamp The timestamp of the resurrection in ms
 * @param timestampMs The current timestamp in ms
 *
 * @returns The total projected digging fees as a string
 */
export function calculateProjectedDiggingFees(
  archaeologists: ArchaeologistData[],
  resurrectionTimestamp: number,
  timestampMs: number
): BigNumber {
  if (resurrectionTimestamp === 0) return ethers.constants.Zero;
  const totalDiggingFeesPerSecond = archaeologists.reduce(
    (acc, curr) => acc.add(curr.profile.minimumDiggingFeePerSecond),
    ethers.constants.Zero
  );

  const resurrectionSeconds = Math.floor(resurrectionTimestamp / 1000);
  const nowSeconds = Math.floor(timestampMs / 1000);

  return totalDiggingFeesPerSecond.mul(resurrectionSeconds - nowSeconds);
}

/**
 * This function estimates sarco per month based on average number of days per month. This value is
 * only used to display to the user, never as an argument to the smart contracts.
 */
export function convertSarcoPerSecondToPerMonth(diggingFeePerSecond: string): string {
  const averageNumberOfSecondsPerMonth = 2628288;
  return BigNumber.from(diggingFeePerSecond).mul(averageNumberOfSecondsPerMonth).toString();
}
