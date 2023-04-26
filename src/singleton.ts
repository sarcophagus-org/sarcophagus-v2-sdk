// src/singleton.ts
import { SarcoClient } from './SarcoClient';

let sarco: SarcoClient | null = null;

// Check if the current environment is a browser environment
const isBrowserEnvironment = typeof window !== 'undefined';

// Conditionally instantiate the SarcoClient only in a browser environment
if (isBrowserEnvironment) {
  sarco = new SarcoClient();
} else {
  console.warn(
    'sarcophagus-v2-sdk: SarcoClient singleton is not available in a non-browser environment. Please instantiate SarcoClient manually.'
  );
}

export default sarco;
