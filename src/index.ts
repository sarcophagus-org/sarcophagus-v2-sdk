import { NodeSarcoClient, NodeSarcoClientConfig } from 'NodeSarcoClient';
import {
  calculateDiggingFees,
  convertSarcoPerSecondToPerMonth,
  getLowestResurrectionTime,
  getLowestRewrapInterval,
} from './helpers/archHelpers';
import { formatSarco } from './helpers/misc';
import { NEGOTIATION_SIGNATURE_STREAM } from './libp2p_node/p2pNodeConfig';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import { SarcoNetworkConfig } from './types';
import {
  ArchaeologistCurseNegotiationParams,
  ArchaeologistData,
  ArchaeologistEncryptedShard,
  ArchaeologistException,
  ArchaeologistExceptionCode,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult,
  ArchaeologistProfile,
  SarcophagusArchaeologist,
  SarcophagusValidationError,
} from './types/archaeologist';

export { sarco } from './singleton';
export { NodeSarcoClient };
export type { NodeSarcoClientConfig, SarcoNetworkConfig };
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
  calculateDiggingFees,
  formatSarco,
  convertSarcoPerSecondToPerMonth,
};
