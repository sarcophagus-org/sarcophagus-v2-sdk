import { WebSarcoClient } from './WebSarcoClient';

let sarco: WebSarcoClient = new WebSarcoClient();
export { sarco };
export { WebSarcoClient };

import { NEGOTIATION_SIGNATURE_STREAM, DHT_PROTOCOL_PREFIX } from './libp2p_node/p2pNodeConfig';
import {
  goerliNetworkConfig,
  mainnetNetworkConfig,
  sepoliaNetworkConfig,
  baseGoerliNetworkConfig,
  polygonMumbaiNetworkConfig,
  BASE_GOERLI_CHAIN_ID,
  GOERLI_CHAIN_ID,
  HARDHAT_CHAIN_ID,
  POLYGON_MUMBAI_CHAIN_ID,
  MAINNET_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
  hardhatNetworkConfig,
  SarcoSupportedNetwork,
} from './networkConfig';
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
  DHT_PROTOCOL_PREFIX,
  SarcophagusValidationError,
  goerliNetworkConfig,
  mainnetNetworkConfig,
  sepoliaNetworkConfig,
  baseGoerliNetworkConfig,
  polygonMumbaiNetworkConfig,
  BASE_GOERLI_CHAIN_ID,
  GOERLI_CHAIN_ID,
  HARDHAT_CHAIN_ID,
  POLYGON_MUMBAI_CHAIN_ID,
  MAINNET_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
  hardhatNetworkConfig,
};
export type {
  SarcoSupportedNetwork,
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
