import { Signer, Wallet, ethers } from 'ethers';
import { SarcoClientConfig } from '../types';

/**
 * Retrieves a Signer instance based on the provided configuration object.
 * This function takes into account the environment it is being executed in (browser or non-browser).
 *
 * @param {SarcoClientConfig} config - Configuration object containing details about the signer.
 * @returns {Signer} - An ethers.js Signer instance.
 * @throws {Error} - If the configuration is invalid or missing required information based on the environment.
 */
export function getSigner(config?: SarcoClientConfig): Signer {
  let signer: Signer;

  const isBrowserEnvironment = typeof window !== 'undefined';

  if (config) {
    const provider = config.provider || ethers.getDefaultProvider();

    if (isBrowserEnvironment) {
      // If in a browser environment, throw an error if a signer, private key, or mnemonic is provided
      if (config.signer || config.privateKey || config.mnemonic) {
        throw new Error(
          'In a browser environment, do not provide a signer, private key, or mnemonic. Use a provider or leave the config empty to use window.ethereum.'
        );
      }

      if (config.provider) {
        // If a provider is given, give it top priority
        signer = new ethers.providers.Web3Provider(config.provider as any).getSigner();
      } else {
        // Since a provider is not given, default to window.ethereum
        if (!!window.ethereum) {
          signer = new ethers.providers.Web3Provider(window.ethereum as any).getSigner();
        }

        // Wondering about this here, Consider storing window instead if connecting in webapp would update this here too
        throw new Error(
          'window.ethereum is not defined. Please provide a provider or ensure that window.ethereum is defined.'
        );
      }
    } else {
      // In a non-browser environment, a signer, private key, or mnemonic must be provided along with the provider
      if (config.signer) {
        signer = config.signer;
      } else if (config.privateKey) {
        signer = new Wallet(config.privateKey, provider);
      } else if (config.mnemonic) {
        signer = Wallet.fromMnemonic(config.mnemonic).connect(provider);
      } else {
        throw new Error(
          'In a non-browser environment, you must provide a signer, private key, or mnemonic along with the provider.'
        );
      }
    }

    if (!signer.provider) {
      signer = signer.connect(provider);
    }
  } else if (isBrowserEnvironment) {
    // If no configuration object is provided and in a browser environment, default to window.ethereum
    signer = new ethers.providers.Web3Provider(window.ethereum as any).getSigner();
  } else {
    // If no configuration object is provided and in a non-browser environment, throw an error
    throw new Error(
      'In a non-browser environment, you must provide a configuration object with a signer, private key, or mnemonic.'
    );
  }

  return signer;
}
