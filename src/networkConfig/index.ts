import { SarcoNetworkConfig } from '../types';

const arweaveConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
};

export const goerliNetworkConfig = (
  providerUrl: string,
  config?: { etherscanApiKey?: string; zeroExApiKey?: string }
): SarcoNetworkConfig => ({
  chainId: 5,
  networkName: 'Goerli Testnet',
  networkShortName: 'Goerli',
  sarcoTokenAddress: '0x4633b43990b41B57b3678c6F3Ac35bA75C3D8436',
  diamondDeployAddress: '0x23205431DAa31e9b54d0EBF40e45CC03aC759a22',
  etherscanApiUrl: 'https://api-goerli.etherscan.io/api',
  etherscanApiKey: config?.etherscanApiKey ?? '',
  explorerUrl: 'https://goerli.etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
  },
  arweaveConfig,
  providerUrl,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/sarco-goerli-test/two',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const mainnetNetworkConfig = (
  providerUrl: string,
  config?: { etherscanApiKey?: string; zeroExApiKey?: string }
): SarcoNetworkConfig => ({
  chainId: 1,
  networkName: 'Etherum Mainnet',
  networkShortName: 'Mainnet',
  sarcoTokenAddress: '0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a',
  diamondDeployAddress: '0x0Ec977D1863Eb919a2Ecd65d17Cc3f2CFdaCe3Ab',
  etherscanApiUrl: 'https://api.etherscan.io/api',
  etherscanApiKey: config?.etherscanApiKey ?? '',
  explorerUrl: 'https://etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://node1.bundlr.network',
  },
  providerUrl,
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/sarcophagus-v2/v0.0.1',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const sepoliaNetworkConfig = (
  providerUrl: string,
  config?: { etherscanApiKey?: string; zeroExApiKey?: string }
): SarcoNetworkConfig => ({
  chainId: 11155111,
  networkName: 'Sepolia Testnet',
  networkShortName: 'Sepolia',
  sarcoTokenAddress: '0xfa1FA4d51FB2babf59e402c83327Ab5087441289',
  diamondDeployAddress: '0x478aDb74347AC204e1b382FC6B944621B97E8D98',
  etherscanApiUrl: 'https://api-sepolia.etherscan.io/api',
  etherscanApiKey: config?.etherscanApiKey ?? '',
  explorerUrl: 'https://sepolia.etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
  },
  providerUrl,
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/sarco-goerli-test/two',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  apiUrlBase: 'https://api.encryptafile.com',
});
