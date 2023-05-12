import {
  ArchaeologistData,
  ArchaeologistException,
  ArchaeologistExceptionCode,
  ArchaeologistProfile,
} from './types/archaeologist';
import { SarcoClient } from './SarcoClient';
import { SarcoClientConfig, SarcoNetworkConfig } from './types';
import { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig } from './networkConfig';

export { sarco } from './singleton';
export { SarcoClient };
export type { SarcoClientConfig, SarcoNetworkConfig };
export type { ArchaeologistData, ArchaeologistException, ArchaeologistProfile, ArchaeologistExceptionCode };

export { goerliNetworkConfig, mainnetNetworkConfig, sepoliaNetworkConfig };
