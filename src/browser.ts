import { WebSarcoClient } from './WebSarcoClient';

let sarco: WebSarcoClient = new WebSarcoClient();
export { sarco };
export { WebSarcoClient };

import { NEGOTIATION_SIGNATURE_STREAM } from './libp2p_node/p2pNodeConfig';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import {
  CallOptions,
  RecoverPublicKeyErrorStatus,
  RecoverPublicKeyResponse,
  SarcoBundlrConfig,
  SarcoNetworkConfig,
} from './types';
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

export type { CallOptions, RecoverPublicKeyResponse, SarcoBundlrConfig, SarcoNetworkConfig };

export { RecoverPublicKeyErrorStatus };

export {
  ArchaeologistExceptionCode,
  NEGOTIATION_SIGNATURE_STREAM,
  SarcophagusValidationError,
  goerliNetworkConfig,
  mainnetNetworkConfig,
  sepoliaNetworkConfig,
};
export type {
  ArchaeologistCurseNegotiationParams,
  ArchaeologistData,
  ArchaeologistEncryptedShard,
  ArchaeologistException,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult,
  ArchaeologistProfile,
  SarcophagusArchaeologist,
};

export { SarcophagusState } from './types/sarcophagi';
export type { SarcophagusData, SarcophagusDetails } from './types/sarcophagi';
export { ChunkingUploader } from '@bundlr-network/client/build/esm/common/chunkingUploader';
import { ZeroExQuote } from './helpers/zeroEx';
export type { ZeroExQuote };
