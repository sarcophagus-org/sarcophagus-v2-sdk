import { SarcoClient } from './SarcoClient';

/**
 * Provides a singleton of the SarcoClient class for use in the browser.
 * Uses window.ethereum as the provider unless a provider is provided.
 */
class BrowserSarcoClient extends SarcoClient {
  constructor() {
    super();
    console.warn(
      'sarcophagus-v2-sdk: BrowserSarcoClient is being used in a non-browser environment. Please instantiate SarcoClient manually with a custom provider.'
    );
  }
}

// Check if the current environment is a browser environment
const isBrowserEnvironment = typeof window !== 'undefined';

// Conditionally instantiate the SarcoClient or BrowserSarcoClient
const sarco = isBrowserEnvironment ? new SarcoClient() : new BrowserSarcoClient();

export default sarco;
