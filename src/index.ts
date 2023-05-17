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
  calculateProjectedDiggingFees,
  convertSarcoPerSecondToPerMonth,
  getLowestResurrectionTime,
  getLowestRewrapInterval,
  getTotalFeesInSarco,
} from './helpers/archHelpers';
import { calculateDiggingFees, formatSarco } from './helpers/misc';

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

export { ArchaeologistExceptionCode, SarcophagusValidationError };
export { NEGOTIATION_SIGNATURE_STREAM };

export { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig };

export {
  getLowestRewrapInterval,
  getLowestResurrectionTime,
  getTotalFeesInSarco,
  calculateDiggingFees,
  formatSarco,
  calculateProjectedDiggingFees,
  convertSarcoPerSecondToPerMonth,
};
