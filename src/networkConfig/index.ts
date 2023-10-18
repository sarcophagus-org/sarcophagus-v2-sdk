import { SarcoNetworkConfig } from '../types';

const arweaveConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
};

export const MAINNET_CHAIN_ID = 1;
export const GOERLI_CHAIN_ID = 5;
export const SEPOLIA_CHAIN_ID = 11155111;
export const BASE_GOERLI_CHAIN_ID = 84531;
export const POLYGON_MUMBAI_CHAIN_ID = 80001;
export const POLYGON_MAINNET_CHAIN_ID = 137;
export const HARDHAT_CHAIN_ID = 31337;

/**
 * A map of supported chain IDs to their network names
 */
export const SARCO_SUPPORTED_NETWORKS: Map<number, string> = new Map([
  [MAINNET_CHAIN_ID, 'mainnet'],
  [GOERLI_CHAIN_ID, 'goerli'],
  [SEPOLIA_CHAIN_ID, 'sepolia'],
  [BASE_GOERLI_CHAIN_ID, 'baseGoerli'],
  [POLYGON_MUMBAI_CHAIN_ID, 'polygonMumbai'],
  [POLYGON_MAINNET_CHAIN_ID, 'polygonMainnet'],
]);

export const hardhatNetworkConfig = (override?: {
  providerUrl?: string;
  sarcoTokenAddress?: string;
  diamondDeployAddress?: string;
}): SarcoNetworkConfig => ({
  chainId: HARDHAT_CHAIN_ID,
  networkName: 'Hardhat Local Network',
  networkShortName: 'HardHat',
  tokenSymbol: 'ETH',
  sarcoTokenAddress: override?.sarcoTokenAddress ?? '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  diamondDeployAddress: override?.diamondDeployAddress ?? '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  etherscanApiUrl: '',
  etherscanApiKey: '',
  explorerUrl: '',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: '',
  },
  arweaveConfig,
  subgraphUrl: '',
  zeroExApiKey: '',
  zeroExApiUrl: '',
  apiUrlBase: '',
});

export const polygonMumbaiNetworkConfig = (config?: {
  polygonScanApiKey?: string;
  zeroExApiKey?: string;
}): SarcoNetworkConfig => ({
  chainId: POLYGON_MUMBAI_CHAIN_ID,
  networkName: 'PolygonMumbai Testnet',
  networkShortName: 'PolygonMumbai',
  tokenSymbol: 'MATIC',
  sarcoTokenAddress: '0x2BC9019e6d9e6a26D7D8d8CDDa4e5dE9B787D7bb',
  diamondDeployAddress: '0x42F2C41e0285B3CBED8084b2c7476F11730935Bc',
  etherscanApiUrl: 'https://api-testnet.polygonscan.com/api',
  etherscanApiKey: config?.polygonScanApiKey ?? '',
  explorerUrl: 'https://mumbai.polygonscan.com/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/polygon-mumbai/v0.0.1',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  zeroExApiUrl: 'https://mumbai.api.0x.org',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const polygonMainnetNetworkConfig = (config?: {
  polygonScanApiKey?: string;
  zeroExApiKey?: string;
}): SarcoNetworkConfig => ({
  chainId: POLYGON_MAINNET_CHAIN_ID,
  networkName: 'Polygon Mainnet',
  networkShortName: 'Polygon',
  tokenSymbol: 'MATIC',
  sarcoTokenAddress: '0x80ae3b3847e4e8bd27a389f7686486cac9c3f3e8',
  diamondDeployAddress: '0xc1984df3e3ddc1DC24d54179CCD5537e290C7E9c',
  etherscanApiUrl: 'https://api.polygonscan.com/api',
  etherscanApiKey: config?.polygonScanApiKey ?? '',
  explorerUrl: 'https://polygonscan.com/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/polygon-mainnet/v0.0.1',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  zeroExApiUrl: 'https://polygon.api.0x.org',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const baseGoerliNetworkConfig = (config?: {
  basescanApiKey?: string;
  zeroExApiKey?: string;
}): SarcoNetworkConfig => ({
  chainId: BASE_GOERLI_CHAIN_ID,
  networkName: 'BaseGoerli Testnet',
  networkShortName: 'BaseGoerli',
  tokenSymbol: 'ETH',
  sarcoTokenAddress: '0x2BC9019e6d9e6a26D7D8d8CDDa4e5dE9B787D7bb',
  diamondDeployAddress: '0xB933926f50b33797d0fa1DaEe65D5830224E53E1',
  etherscanApiUrl: 'https://api-goerli.basescan.org/api',
  etherscanApiKey: config?.basescanApiKey ?? '',
  explorerUrl: 'https://goerli.basescan.org',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/base-goerli/v0.0.1',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  zeroExApiUrl: '',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const goerliNetworkConfig = (config?: {
  etherscanApiKey?: string;
  zeroExApiKey?: string;
}): SarcoNetworkConfig => ({
  chainId: GOERLI_CHAIN_ID,
  networkName: 'Goerli Testnet',
  networkShortName: 'Goerli',
  tokenSymbol: 'ETH',
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
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/sarco-goerli-test/two',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  zeroExApiUrl: 'https://goerli.api.0x.org',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const mainnetNetworkConfig = (config?: {
  etherscanApiKey?: string;
  zeroExApiKey?: string;
}): SarcoNetworkConfig => ({
  chainId: MAINNET_CHAIN_ID,
  networkName: 'Etherum Mainnet',
  networkShortName: 'Mainnet',
  tokenSymbol: 'ETH',
  sarcoTokenAddress: '0x7697b462a7c4ff5f8b55bdbc2f4076c2af9cf51a',
  diamondDeployAddress: '0x0Ec977D1863Eb919a2Ecd65d17Cc3f2CFdaCe3Ab',
  etherscanApiUrl: 'https://api.etherscan.io/api',
  etherscanApiKey: config?.etherscanApiKey ?? '',
  explorerUrl: 'https://etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://node1.bundlr.network',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/sarcophagus-v2/v0.0.1',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  zeroExApiUrl: 'https://api.0x.org',
  apiUrlBase: 'https://api.encryptafile.com',
});

export const sepoliaNetworkConfig = (config?: {
  etherscanApiKey?: string;
  zeroExApiKey?: string;
}): SarcoNetworkConfig => ({
  chainId: SEPOLIA_CHAIN_ID,
  networkName: 'Sepolia Testnet',
  networkShortName: 'Sepolia',
  tokenSymbol: 'ETH',
  sarcoTokenAddress: '0xfa1FA4d51FB2babf59e402c83327Ab5087441289',
  diamondDeployAddress: '0x46395641cf7814d51b1688dA19129343E04279C6',
  etherscanApiUrl: 'https://api-sepolia.etherscan.io/api',
  etherscanApiKey: config?.etherscanApiKey ?? '',
  explorerUrl: 'https://sepolia.etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/49076/sepolia/v0.0.1',
  zeroExApiKey: config?.zeroExApiKey ?? '',
  zeroExApiUrl: '',
  apiUrlBase: 'https://api.encryptafile.com',
});

export type NetworkConfigParams = { 
  etherscanApiKey?: string; 
  basescanApiKey?: string; 
  polygonScanApiKey?: string;
  zeroExApiKey?: string 
};

export type NetworkConfigBuilder = (params?: NetworkConfigParams) => SarcoNetworkConfig;

/**
 * Returns a network config builder for the given chain ID.
 *
 * If the chain ID is not supported, undefined is returned.
 *
 * @param chainId The chain ID to setup the network config for
 * @returns The network config builder for the given chain ID
 */
export function getNetworkConfigBuilder(chainId: number): NetworkConfigBuilder | undefined {
  const chainIdToConfigBuilder: Map<number, NetworkConfigBuilder> = new Map([
    [MAINNET_CHAIN_ID, config => mainnetNetworkConfig(config)],
    [GOERLI_CHAIN_ID, config => goerliNetworkConfig(config)],
    [SEPOLIA_CHAIN_ID, config => sepoliaNetworkConfig(config)],
    [POLYGON_MUMBAI_CHAIN_ID, config => polygonMumbaiNetworkConfig(config)],
    [POLYGON_MAINNET_CHAIN_ID, config => polygonMainnetNetworkConfig(config)],
    [BASE_GOERLI_CHAIN_ID, config => baseGoerliNetworkConfig(config)],
    [HARDHAT_CHAIN_ID, _ => hardhatNetworkConfig()],
  ]);

  return chainIdToConfigBuilder.get(chainId);
}
