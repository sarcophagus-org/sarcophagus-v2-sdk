import { SarcoNetworkConfig } from '../types';

const arweaveConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
};

export const mainnetNetworkConfig: SarcoNetworkConfig = {
  chainId: 1,
  networkName: 'Etherum Mainnet',
  networkShortName: 'Mainnet',
  sarcoTokenAddress: '',
  diamondDeployAddress: '',
  etherscanApiUrl: 'https://api.etherscan.io/api',
  etherscanApiKey: '',
  explorerUrl: 'https://etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://node1.bundlr.network',
    providerUrl: process.env.REACT_APP_BUNDLR_MAINNET_PROVIDER ?? 'https://rpc.ankr.com/eth',
  },
  arweaveConfig,
  subgraphUrl: '',
};

export const goerliNetworkConfig: SarcoNetworkConfig = {
  chainId: 5,
  networkName: 'Goerli Testnet',
  networkShortName: 'Goerli',
  sarcoTokenAddress: '0x4633b43990b41B57b3678c6F3Ac35bA75C3D8436',
  diamondDeployAddress: '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf',
  etherscanApiUrl: 'https://api-goerli.etherscan.io/api',
  etherscanApiKey: process.env.REACT_APP_ETHERSCAN_API_KEY ?? '',
  explorerUrl: 'https://goerli.etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
    providerUrl: process.env.REACT_APP_BUNDLR_GOERLI_PROVIDER ?? 'https://rpc.ankr.com/eth_goerli',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/44302/sarcotest2/18',
};

export const sepoliaNetworkConfig: SarcoNetworkConfig = {
  chainId: 11155111,
  networkName: 'Sepolia Testnet',
  networkShortName: 'Sepolia',
  sarcoTokenAddress: '0xfa1FA4d51FB2babf59e402c83327Ab5087441289',
  diamondDeployAddress: '0x478aDb74347AC204e1b382FC6B944621B97E8D98',
  etherscanApiUrl: 'https://api-sepolia.etherscan.io/api',
  etherscanApiKey: '',
  explorerUrl: 'https://sepolia.etherscan.io/',
  bundlr: {
    currencyName: 'ethereum',
    nodeUrl: 'https://devnet.bundlr.network',
    providerUrl: process.env.REACT_APP_BUNDLR_SEPOLIA_PROVIDER ?? 'https://rpc.ankr.com/eth_sepolia',
  },
  arweaveConfig,
  subgraphUrl: 'https://api.studio.thegraph.com/query/44302/sarcotest2/18',
};
