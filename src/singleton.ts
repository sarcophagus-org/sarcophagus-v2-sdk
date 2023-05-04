import { SarcoClient } from './SarcoClient';

const isBrowserEnvironment = typeof window !== 'undefined';

let sarcoInstance: SarcoClient | undefined;

/**
 * Provides a singleton of the SarcoClient class for use in the browser.
 * Uses window.ethereum as the provider unless a provider is provided.
 * @returns A SarcoClient singleton.
 */
export const getSarcoClientInstance = (): SarcoClient => {
  if (!isBrowserEnvironment) {
    throw new Error(
      'sarcophagus-v2-sdk: getSarcoClientInstance() can only be used in a browser environment. Please instantiate SarcoClient manually with a custom provider to use the sdk in a non-browser enviroment.'
    );
  }

  if (!sarcoInstance) sarcoInstance = new SarcoClient();
  return sarcoInstance;
};
