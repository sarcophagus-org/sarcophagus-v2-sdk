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

async function queryGraphQl(query: string) {
    const subgraphUrl = process.env.REACT_APP_SUBGRAPH_API_URL!;

    let response: Response;
    const fetchOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    };

    if (window === undefined) {
      console.log('node feytch');
      
      let fetch = require('isomorphic-fetch');
      response = await fetch(subgraphUrl, fetchOptions);
    } else {
      console.log('normal feytch');
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

export const getArchaeologists = async (): Promise<ArchDataSubgraph[]> => {
  try {
    const { archaeologists } = await queryGraphQl(getArchsQuery) as { archaeologists: ArchDataSubgraph[] };
    return archaeologists;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get archaeolgists from subgraph');
  }
};

export const getSarcophagusRewraps = async (sarcoId: string) => {
  try {
    const { rewrapSarcophaguses } = await queryGraphQl(getSarcoRewrapsQuery(sarcoId)) as { rewrapSarcophaguses: any[] };

    return rewrapSarcophaguses;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get rewraps from subgraph');
  }
};