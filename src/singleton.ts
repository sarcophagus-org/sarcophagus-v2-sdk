import { SarcoClient } from './SarcoClient';

const isBrowserEnvironment = typeof window !== 'undefined';

/**
 * Provides a singleton of the SarcoClient class for use in the browser.
 * Uses window.ethereum as the provider unless a provider is provided.
 */
class BrowserSarcoClient extends SarcoClient {
  constructor() {
    if (!isBrowserEnvironment) {
      console.warn(
        'sarcophagus-v2-sdk: BrowserSarcoClient is being used in a non-browser environment. Please instantiate SarcoClient manually with a custom provider.'
      );
    }

    super();
  }
}

let sarcoInstance: BrowserSarcoClient | undefined;

/**
 * @returns The BrowserSarcoClient singleton.
 */
const getSarcoClientInstance = () => {
  if (!sarcoInstance) sarcoInstance = new BrowserSarcoClient();
  return sarcoInstance;
};

export default getSarcoClientInstance;
