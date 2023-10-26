import { PrivateKeyPublish, SarcoCounts, SarcophagusRewrap } from '../types/sarcophagi';
import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client/core/index.js';

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

export interface SarcoDataSubgraph {
  sarcoId: string;
  arweaveTxId: string;
  embalmer: string;
  publishes: string[];
  threshold: string;
  recipient: string;
  cursedArchaeologists: string[];
  accusalCount: string;
  resurrectionTime: string;
  previousRewrapTime: string;
  blockTimestamp: string;
}

export interface SarcoRewrapsSubgraph {
  blockTimestamp: string;
  totalDiggingFees: string;
  rewrapSarcophagusProtocolFees: string;
}

async function queryGraphQl(subgraphUrl: string, query: string) {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: subgraphUrl,
    }),
    cache: new InMemoryCache(),
  });

  // set fetch policy to avoid serving cached data
  // @ts-ignore
  const response = await client.query({
    query: gql(query),
    fetchPolicy: 'network-only',
  });

  return response.data;
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

const getSarcoWithRewrapsQuery = (sarcoId: string) => {
  return `query {
    sarcophagusData (id: "${sarcoId}") {
        sarcoId
        resurrectionTime
        embalmer
        previousRewrapTime
        publishes
        arweaveTxId
        blockTimestamp
    },
    rewrapSarcophaguses (where:{sarcoId: "${sarcoId}"}) {
      blockTimestamp
      totalDiggingFees
      rewrapSarcophagusProtocolFees
    }
  }`;
};

const getSarcosQuery = (sarcoIds: string[]) => `query {
  sarcophagusDatas (where: {sarcoId_in: [${sarcoIds.map(id => `"${id}",`)}]}) {
      sarcoId
      resurrectionTime
      embalmer
      previousRewrapTime
      publishes
      recipient
      threshold
      cursedArchaeologists
      accusalCount
      arweaveTxId
      blockTimestamp
  }
}`;

const getEmbalmerOrRecipientSarcosQuery = (address: string, isRecipient: boolean) => `query {
  sarcophagusDatas (where: {${isRecipient ? 'recipient' : 'embalmer'}: "${address}"}) {
      sarcoId
      resurrectionTime
      embalmer
      previousRewrapTime
      publishes
      recipient
      threshold
      cursedArchaeologists
      accusalCount
      arweaveTxId
      blockTimestamp
  }
}`;

const getPrivateKeyPublishesQuery = (sarcoId: string) => `query {
  publishPrivateKeys (where:{sarcoId: "${sarcoId}"}) {
      privateKey
      archaeologist
    }
}`;

const getSarcoCountsQuery = `query {
  systemDatas {
    activeSarcophagusIds
    inactiveSarcophagusIds
  }
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

export const getSubgraphSarcophagi = async (subgraphUrl: string, sarcoIds: string[]): Promise<SarcoDataSubgraph[]> => {
  try {
    const { sarcophagusDatas } = (await queryGraphQl(subgraphUrl, getSarcosQuery(sarcoIds))) as {
      sarcophagusDatas: SarcoDataSubgraph[];
    };

    return sarcophagusDatas;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get sarcophagi from subgraph');
  }
};

export const getEmbalmerSarcophagi = async (subgraphUrl: string, address: string): Promise<SarcoDataSubgraph[]> => {
  try {
    const { sarcophagusDatas } = (await queryGraphQl(
      subgraphUrl,
      getEmbalmerOrRecipientSarcosQuery(address, false)
    )) as {
      sarcophagusDatas: SarcoDataSubgraph[];
    };

    return sarcophagusDatas;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get sarcophagi from subgraph');
  }
};

export const getRecipientSarcophagi = async (subgraphUrl: string, address: string): Promise<SarcoDataSubgraph[]> => {
  try {
    const { sarcophagusDatas } = (await queryGraphQl(
      subgraphUrl,
      getEmbalmerOrRecipientSarcosQuery(address, true)
    )) as {
      sarcophagusDatas: SarcoDataSubgraph[];
    };

    return sarcophagusDatas;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get sarcophagi from subgraph');
  }
};

export const getPrivateKeyPublishes = async (subgraphUrl: string, sarcoId: string): Promise<PrivateKeyPublish[]> => {
  try {
    const { publishPrivateKeys } = (await queryGraphQl(subgraphUrl, getPrivateKeyPublishesQuery(sarcoId))) as {
      publishPrivateKeys: PrivateKeyPublish[];
    };

    return publishPrivateKeys;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get sarcophagi from subgraph');
  }
};

export const getSubgraphSarcophagusWithRewraps = async (
  subgraphUrl: string,
  sarcoId: string
): Promise<SarcoDataSubgraph & { rewraps: SarcophagusRewrap[] }> => {
  try {
    const { sarcophagusData, rewrapSarcophaguses } = (await queryGraphQl(
      subgraphUrl,
      getSarcoWithRewrapsQuery(sarcoId)
    )) as {
      rewrapSarcophaguses: SarcophagusRewrap[];
      sarcophagusData: SarcoDataSubgraph;
    };

    return { ...sarcophagusData, rewraps: rewrapSarcophaguses };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get sarcophagus from subgraph');
  }
};

export const getSubgraphSarcoCounts = async (subgraphUrl: string): Promise<SarcoCounts> => {
  try {
    const { activeSarcophagusIds, inactiveSarcophagusIds } = (
      (await queryGraphQl(subgraphUrl, getSarcoCountsQuery)) as {
        systemDatas: {
          activeSarcophagusIds: string[];
          inactiveSarcophagusIds: string[];
        }[];
      }
    ).systemDatas[0];

    // TODO: Remove this once the subgraph is fixed
    const uniqueActiveSarcophagusIds: string[] = [...new Set(activeSarcophagusIds)];
    const uniqueInactiveSarcophagusIds: string[] = [...new Set(inactiveSarcophagusIds)];

    return {
      activeSarcophagi: uniqueActiveSarcophagusIds.filter(a => !uniqueInactiveSarcophagusIds.includes(a)).length,
      inactiveSarcophagi: uniqueInactiveSarcophagusIds.filter(a => !activeSarcophagusIds.includes(a)).length,
    };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to get sarcophagus counts from subgraph');
  }
};
