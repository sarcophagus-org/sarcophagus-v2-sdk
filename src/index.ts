import {
  ArchaeologistData,
  ArchaeologistException,
  ArchaeologistExceptionCode,
  ArchaeologistProfile,
} from './types/archaeologist';
import { SarcoClient } from './SarcoClient';
import { SarcoClientConfig, SarcoNetworkConfig } from './types';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';
import { NEGOTIATION_SIGNATURE_STREAM } from './libp2p_node/p2pNodeConfig';

export { sarco } from './singleton';
export { SarcoClient };
export type { SarcoClientConfig, SarcoNetworkConfig };
export type { ArchaeologistData, ArchaeologistException, ArchaeologistProfile };

export { ArchaeologistExceptionCode };
export { NEGOTIATION_SIGNATURE_STREAM };

export { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig };
