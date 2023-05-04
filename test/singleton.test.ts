import { getSarcoClientInstance } from '../src/singleton'
import { setupTestProvider } from './helpers';

describe('SarcophagusSDK', () => {
  describe('getSarcoClientInstance', () => {
    afterEach(() => {
      global.window = undefined as any;
    });

    test('returns a SarcoClient singleton if called in a browser environment', () => {
      // Simulate a connected browser environment
      global.window = {} as any;
      window['ethereum'] = setupTestProvider();

      const sarco = getSarcoClientInstance();
      expect(sarco).toBeDefined();
    });

    test('returns the same SarcoClient singleton even if called multiple times', () => {
      // Simulate a connected browser environment
      global.window = {} as any;
      window['ethereum'] = setupTestProvider();

      const sarco = getSarcoClientInstance();
      const sarco2 = getSarcoClientInstance();
      expect(sarco === sarco2).toBe(true);
    });

    test('throws if called in a non-browser environment', () => {
      expect(() => getSarcoClientInstance()).toThrowError();
    });
  });
});
