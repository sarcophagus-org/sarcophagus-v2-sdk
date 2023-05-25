import { WebSarcoClient } from './WebSarcoClient';

let sarcoInstance: WebSarcoClient | undefined;

const getSarcoClientInstance = (): WebSarcoClient => {
  const isBrowserEnvironment = typeof window !== 'undefined';
  if (!isBrowserEnvironment) {
    throw new Error(
      'sarcophagus-v2-sdk: getSarcoClientInstance() can only be used in a browser environment. Please instantiate SarcoClient manually with a custom provider to use the sdk in a non-browser enviroment.'
    );
  }

  if (!sarcoInstance) sarcoInstance = new WebSarcoClient();
  return sarcoInstance;
};

export const sarco = getSarcoClientInstance();
