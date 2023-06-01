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

export type { SarcoNetworkConfig };
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
