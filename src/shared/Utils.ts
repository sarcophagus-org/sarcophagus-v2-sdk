import { BigNumber, ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import moment from 'moment';
import { SarcophagusData, SarcophagusResponseContract, SarcophagusState } from './types/sarcophagi';

export class Utils {
  formatSarco(valueInWei: string | number, precision: number = 2): string {
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
   * This function estimates sarco per month based on average number of days per month. This value is
   * only used to display to the user, never as an argument to the smart contracts.
   */
  convertSarcoPerSecondToPerMonth(diggingFeePerSecond: string): string {
    const averageNumberOfSecondsPerMonth = 2628288;
    return BigNumber.from(diggingFeePerSecond).mul(averageNumberOfSecondsPerMonth).toString();
  }

  async getBlockTimestamp(provider: ethers.providers.Provider): Promise<number> {
    try {
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);

      return block.timestamp;
    } catch (error) {
      // Not a good fallback, may want to institute a retry or failure (or notification)
      console.warn(`Error retrieving block time: ${error}`, true);
      return Math.trunc(Date.now() / 1000);
    }
  }

  async getDateFromTimestamp(timestamp: number) {
    new Date(timestamp * 1000);
  }

  /**
   * Builds a resurrection date string from a BigNumber
   * Ex: 09.22.2022 7:30pm (12 Days)
   * @param resurrectionTime
   * @returns The resurrection string
   */
  buildResurrectionDateString(
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

  async getCurrentTimeSec(provider: ethers.providers.Provider | ethers.providers.Web3Provider) {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    return block.timestamp;
  }

  getSarcophagusState(
    sarco: SarcophagusResponseContract | SarcophagusData,
    gracePeriod: number,
    timestampMs: number
  ): SarcophagusState {
    if (sarco.resurrectionTime.eq(ethers.constants.Zero)) return SarcophagusState.DoesNotExist;
    if (sarco.resurrectionTime.eq(ethers.constants.MaxUint256)) return SarcophagusState.Buried;
    if (sarco.isCompromised) return SarcophagusState.Accused;

    const timestampSec = Math.trunc(timestampMs / 1000);

    const isPastGracePeriod = timestampSec >= sarco.resurrectionTime.toNumber() + gracePeriod;

    if (sarco.publishedPrivateKeyCount >= sarco.threshold)
      return sarco.isCleaned ? SarcophagusState.CleanedResurrected : SarcophagusState.Resurrected;

    const withinGracePeriod =
      timestampSec >= sarco.resurrectionTime.toNumber() &&
      timestampSec < sarco.resurrectionTime.toNumber() + gracePeriod;

    if (withinGracePeriod) return SarcophagusState.Resurrecting;

    if (isPastGracePeriod) return sarco.isCleaned ? SarcophagusState.CleanedFailed : SarcophagusState.Failed;

    return SarcophagusState.Active;
  }
}
