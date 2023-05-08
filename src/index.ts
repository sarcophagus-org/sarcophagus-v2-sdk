import { SarcoClient } from './SarcoClient';
import { SarcoClientConfig } from './types';

import { getSarcoClientInstance } from './singleton';
export const sarcoClient = getSarcoClientInstance();

export { SarcoClient };
export type { SarcoClientConfig };
