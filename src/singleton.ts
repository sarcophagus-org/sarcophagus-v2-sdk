import { SarcoClient } from './SarcoClient';

let sarcoInstance: SarcoClient | undefined;

const getSarcoClientInstance = (): SarcoClient => {
  const isBrowserEnvironment = typeof window !== 'undefined';
  if (!isBrowserEnvironment) {
    throw new Error(
      'sarcophagus-v2-sdk: getSarcoClientInstance() can only be used in a browser environment. Please instantiate SarcoClient manually with a custom provider to use the sdk in a non-browser enviroment.'
    );
  }

  if (!sarcoInstance) sarcoInstance = new SarcoClient();
  return sarcoInstance;
};

// Create a Proxy object that will handle the lazy initialization of the sarco singleton.
// The primary motive for using a Proxy is to prevent the singleton from being created
// outside a browser environment, such as in a Node.js service or during testing.
// With the Proxy, the singleton will only be initialized when its properties or methods are accessed,
// allowing us to prevent unintended initialization in non-browser environments.
const sarcoProxy = new Proxy<SarcoClient>({} as SarcoClient, {
  // The 'get' trap function is called when an attempt is made to access a property on the proxy object.
  // It takes two arguments: 'target' (the dummy target object) and 'prop' (the property being accessed).
  get: (target, prop) => {
    // If the sarco singleton hasn't been initialized yet, call getSarcoClientInstance to create it.
    if (!sarcoInstance) {
      sarcoInstance = getSarcoClientInstance();
    }
    // Return the value of the property from the initialized sarco singleton.
    // This uses the 'prop' argument as a key in the sarcoInstance object.
    return sarcoInstance[prop as keyof SarcoClient];
  },
  set(target, p, newValue, receiver) {
    if (!sarcoInstance) {
      sarcoInstance = getSarcoClientInstance();
    }

    // @ts-ignore
    sarcoInstance[p as keyof SarcoClient] = newValue;
    return true;
  },
});

// Export the sarcoProxy object, which will handle the lazy initialization of the sarco singleton.
// When the 'sarco' object is imported and its properties or methods are accessed, the Proxy will ensure
// that the singleton is initialized only when needed, avoiding unnecessary calls to getSarcoClientInstance().
export const sarco = sarcoProxy;
