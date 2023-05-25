import {
  ArchaeologistData,
  ArchaeologistEncryptedShard,
  ArchaeologistException,
  ArchaeologistExceptionCode,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult,
  ArchaeologistProfile,
  ArchaeologistCurseNegotiationParams,
  SarcophagusArchaeologist,
  SarcophagusValidationError,
} from './types/archaeologist';
import { SarcoClient } from './SarcoClient';
import { SarcoClientConfig, SarcoNetworkConfig } from './types';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import { NEGOTIATION_SIGNATURE_STREAM } from './libp2p_node/p2pNodeConfig';
import {
  calculateDiggingFees,
  convertSarcoPerSecondToPerMonth,
  getLowestResurrectionTime,
  getLowestRewrapInterval,
} from './helpers/archHelpers';
import { formatSarco } from './helpers/misc';
import { SarcophagusDetails, SarcophagusData, SarcophagusState } from './types/sarcophagi';
import { OnDownloadProgress } from 'types/arweave';

export { sarco } from './singleton';
export { SarcoClient };
export type { SarcoClientConfig, SarcoNetworkConfig };
export type {
  ArchaeologistData,
  ArchaeologistException,
  ArchaeologistProfile,
  SarcophagusArchaeologist,
  ArchaeologistEncryptedShard,
  ArchaeologistCurseNegotiationParams,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult,
};
export type { SarcophagusData, SarcophagusDetails };
export type { OnDownloadProgress };

export { ArchaeologistExceptionCode, SarcophagusValidationError, SarcophagusState };
export { NEGOTIATION_SIGNATURE_STREAM };

export { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig };

export {
  getLowestRewrapInterval,
  getLowestResurrectionTime,
  calculateDiggingFees,
  formatSarco,
  convertSarcoPerSecondToPerMonth,
};
