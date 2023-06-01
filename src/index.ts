<<<<<<< HEAD
import { NodeSarcoClient, NodeSarcoClientConfig } from 'NodeSarcoClient';
import {
  calculateDiggingFees,
  convertSarcoPerSecondToPerMonth,
  getLowestResurrectionTime,
  getLowestRewrapInterval,
} from './helpers/archHelpers';
import { formatSarco } from './helpers/misc';
import { SarcophagusFilter, SarcophagusDetails, SarcophagusData, SarcophagusState } from './types/sarcophagi';
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
export type { SarcophagusData, SarcophagusDetails };

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
=======
export { WebSarcoClient } from "./browser/WebSarcoClient";
export { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from "./shared/networkConfig";
export { sarco } from "./browser/index";
export type { ArchaeologistData, ArchaeologistEncryptedShard, SarcophagusArchaeologist, ArchaeologistException } from './shared/types/archaeologist';
export type { SarcoNetworkConfig } from './shared/types/index';
>>>>>>> Finish typing update
