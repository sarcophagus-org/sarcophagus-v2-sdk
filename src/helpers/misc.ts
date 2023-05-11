import { SarcoClient } from 'SarcoClient';

export const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getBlockTimestamp = async (sarco: SarcoClient): Promise<number> => {
  try {
    const provider = sarco.signer.provider!;
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);

    return block.timestamp;
  } catch (error) {
    // Not a good fallback, may want to institute a retry or failure (or notification)
    console.warn(`Error retrieving block time: ${error}`, true);
    return Math.trunc(Date.now() / 1000);
  }
};

export const getDateFromTimestamp = (timestamp: number) => new Date(timestamp * 1000);