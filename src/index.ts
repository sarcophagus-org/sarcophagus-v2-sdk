import { SarcoClient } from './SarcoClient';
import { SarcoClientConfig, SarcoNetworkConfig } from './types';

export { getSarcoClientInstance } from './singleton';
export { SarcoClient };
export type { SarcoClientConfig, SarcoNetworkConfig };

export {
    goerliNetworkConfig,
    sepoliaNetworkConfig,
    mainnetNetworkConfig
} from './networkConfig/index';
