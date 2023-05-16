import { BigNumber, ethers } from 'ethers';
import { ArchaeologistData } from 'types/archaeologist';
import { formatSarco } from './misc';

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
 * @param diggingFeeRates An array of the archaeologist's digging fees per second rates
 * @param resurrectionTimestamp The timestamp of the resurrection in ms
 * @returns The total projected digging fees as a string
 */
export function calculateProjectedDiggingFees(
  diggingFeeRates: BigNumber[],
  resurrectionTimestamp: number,
  timestampMs: number
): BigNumber {
  if (resurrectionTimestamp === 0) return ethers.constants.Zero;
  const totalDiggingFeesPerSecond = diggingFeeRates.reduce((acc, curr) => acc.add(curr), ethers.constants.Zero);

  const resurrectionSeconds = Math.floor(resurrectionTimestamp / 1000);
  const nowSeconds = Math.floor(timestampMs / 1000);

  return totalDiggingFeesPerSecond.mul(resurrectionSeconds - nowSeconds);
}

/**
 * Returns the estimated total digging fees, and protocol fee,
 * that the embalmer will be due to pay.
 */
export function getTotalFeesInSarco(
  resurrectionTimestamp: number,
  diggingFeeRates: BigNumber[],
  timestampMs: number,
  protocolFeeBasePercentage?: number
) {
  const totalDiggingFees = calculateProjectedDiggingFees(diggingFeeRates, resurrectionTimestamp, timestampMs);

  // protocolFeeBasePercentage is pulled from the chain, temp show 0 until it loads
  const protocolFee = protocolFeeBasePercentage
    ? totalDiggingFees.div(BigNumber.from(100 * protocolFeeBasePercentage))
    : ethers.constants.Zero;

  return {
    totalDiggingFees,
    formattedTotalDiggingFees: formatSarco(totalDiggingFees.toString()),
    protocolFee,
  };
}

/**
 * This function estimates sarco per month based on average number of days per month. This value is
 * only used to display to the user, never as an argument to the smart contracts.
 */
export function convertSarcoPerSecondToPerMonth(diggingFeePerSecond: string): string {
  const averageNumberOfSecondsPerMonth = 2628288;
  return BigNumber.from(diggingFeePerSecond).mul(averageNumberOfSecondsPerMonth).toString();
}
