import { BigNumber, ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import moment from 'moment';

export const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getBlockTimestamp = async (provider: ethers.providers.Provider): Promise<number> => {
  try {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);

    return block.timestamp;
  } catch (error) {
    // Not a good fallback, may want to institute a retry or failure (or notification)
    console.warn(`Error retrieving block time: ${error}`, true);
    return Math.trunc(Date.now() / 1000);
  }
};

export const getDateFromTimestamp = (timestamp: number) => new Date(timestamp * 1000);

/**
 * Reduces the number of decimals displayed for sarco value (or any float). If the value is a whole
 * number, decimals will be hidden. If a precision of 2 is set and the value is 0.0000452, then
 * "< 0.01" will be returned.
 *
 * @param valueInWei The value to be formateed
 * @param precision The number of decimal places to show
 * @returns A formatted value
 */
export function formatSarco(valueInWei: string | number, precision: number = 2): string {
  const value = formatEther(valueInWei.toString());
  const numericValue: number = Number(value);
  if (isNaN(numericValue)) {
    return value.toString();
  }
  const formattedValue: string = numericValue.toFixed(precision).replace(/\.?0*$/, '');

  if (formattedValue === '0' && parseFloat(value) > 0) {
    return `< 0.${'0'.repeat(precision - 1)}1`;
  }

  return formattedValue;
}

/**
 * Builds a resurrection date string from a BigNumber
 * Ex: 09.22.2022 7:30pm (12 Days)
 * @param resurrectionTime
 * @returns The resurrection string
 */
export function buildResurrectionDateString(
  resurrectionTime: BigNumber | undefined,
  timestampMs: number,
  options?: { format?: string; hideDuration?: boolean }
): string {
  const { format = 'MM.DD.YYYY h:mmA', hideDuration = false } = options || {};

  // In the case where sarcophagus resurrection time is not defined for whatever reason
  if (!resurrectionTime) {
    return '--';
  }

  // In the case where the sarcophagus is buried, the resurrection time will be set to the max
  // uint256 value. It's not possible to display this number as a date.
  if (resurrectionTime.toString() === ethers.constants.MaxUint256.toString()) {
    return '--';
  }

  const resurrectionDateString = moment.unix(resurrectionTime.toNumber()).format(format);
  const msUntilResurrection = resurrectionTime.toNumber() * 1000 - timestampMs;
  const humanizedDuration = moment.duration(msUntilResurrection).humanize();
  const timeUntilResurrection = msUntilResurrection < 0 ? `${humanizedDuration} ago` : humanizedDuration;
  return hideDuration ? resurrectionDateString : `${resurrectionDateString} (${timeUntilResurrection})`;
}

export async function getCurrentTimeSec(provider: ethers.providers.Provider | ethers.providers.Web3Provider) {
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  return block.timestamp;
}

