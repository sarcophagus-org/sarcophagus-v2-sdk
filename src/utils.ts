import { ethers } from 'ethers';
import { SarcophagusData, SarcophagusResponseContract, SarcophagusState } from './types/sarcophagi';

export const getSarcophagusState = (
  sarco: SarcophagusResponseContract | SarcophagusData,
  gracePeriod: number,
  timestampMs: number
): SarcophagusState => {
  if (sarco.resurrectionTime.eq(ethers.constants.Zero)) return SarcophagusState.DoesNotExist;
  if (sarco.resurrectionTime.eq(ethers.constants.MaxUint256)) return SarcophagusState.Buried;
  if (sarco.isCompromised) return SarcophagusState.Accused;

  const timestampSec = Math.trunc(timestampMs / 1000);

  const isPastGracePeriod = timestampSec >= sarco.resurrectionTime.toNumber() + gracePeriod;

  if (sarco.publishedPrivateKeyCount >= sarco.threshold)
    return sarco.isCleaned ? SarcophagusState.CleanedResurrected : SarcophagusState.Resurrected;

  const withinGracePeriod =
    timestampSec >= sarco.resurrectionTime.toNumber() && timestampSec < sarco.resurrectionTime.toNumber() + gracePeriod;

  if (withinGracePeriod) return SarcophagusState.Resurrecting;

  if (isPastGracePeriod) return sarco.isCleaned ? SarcophagusState.CleanedFailed : SarcophagusState.Failed;

  return SarcophagusState.Active;
};
