export interface ArchDataSubgraph {
  address: string;
  successes: string[];
  accusals: string;
  failures: string;
  peerId: string;
  freeBond: string;
  maximumResurrectionTime: string;
  maximumRewrapInterval: string;
  minimumDiggingFeePerSecond: string;
  curseFee: string;
}

async function queryGraphQl(subgraphUrl: string, query: string) {
  let response: Response;
  const fetchOptions = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  };

  if (window === undefined) {
    let fetch = require('isomorphic-fetch');
    response = await fetch(subgraphUrl, fetchOptions);
  } else {
    response = await fetch(subgraphUrl, fetchOptions);
  }

  const { data } = (await response!.json()) as { data: any };
  return data;
}

const getArchsQuery = `query {
    archaeologists (orderBy: blockTimestamp, first: 1000) {
        address
        successes
        accusals
        failures
        freeBond
        maximumResurrectionTime
        maximumRewrapInterval
        minimumDiggingFeePerSecond
        curseFee
        peerId
    }
  }`;

const getSarcoRewrapsQuery = (sarcoId: string) => `query {
  rewrapSarcophaguses (where: {sarcoId: "${sarcoId}"}) { id }
}`;

export const getArchaeologists = async (subgraphUrl: string): Promise<ArchDataSubgraph[]> => {
  try {
    const { archaeologists } = (await queryGraphQl(subgraphUrl, getArchsQuery)) as {
      archaeologists: ArchDataSubgraph[];
    };
    return archaeologists;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get archaeolgists from subgraph');
  }
};

export const getSarcophagusRewraps = async (subgraphUrl: string, sarcoId: string) => {
  try {
    const { rewrapSarcophaguses } = (await queryGraphQl(subgraphUrl, getSarcoRewrapsQuery(sarcoId))) as {
      rewrapSarcophaguses: any[];
    };

    return rewrapSarcophaguses;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get rewraps from subgraph');
  }
};
