import { BigNumber, ethers } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { getArchaeologists } from './helpers/subgraph';

import { ArchaeologistData, ArchaeologistExceptionCode } from './types/archaeologist';
import { ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { safeContractCall } from './helpers/safeContractCall';
import { Multiaddr, multiaddr } from '@multiformats/multiaddr';
import { Connection } from '@libp2p/interface-connection';
import { PeerId } from '@libp2p/interface-peer-id';
import { Address } from './types';
import { Libp2p } from 'libp2p';

const getDialAddress = (arch: ArchaeologistData): PeerId | Multiaddr => {
  // If peerIdParsed has 2 elements, it has a domain and peerId <domain>:<peerId>
  // Otherwise it is just <peerId>
  const peerIdParsed = arch.profile.peerId.split(':');

  if (peerIdParsed.length === 2) {
    return multiaddr(`/dns4/${peerIdParsed[0]}/tcp/443/wss/p2p/${peerIdParsed[1]}`);
  } else {
    // TODO: import PeerId type from sarco-sdk?
    // @ts-ignore
    return arch.fullPeerId!;
  }
};

/**
 * The ArchaeologistApi class provides a high-level interface for interacting with
 * archaeologists on the Sarcophagus V2 protocol.
 */
export class ArchaeologistApi {
  private viewStateFacet: ethers.Contract;
  private subgraphUrl: string;
  private p2pNode: Libp2p;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, subgraphUrl: string, p2pNode: Libp2p) {
    this.subgraphUrl = subgraphUrl;
    this.viewStateFacet = new ethers.Contract(diamondDeployAddress, ViewStateFacet__factory.abi, signer);
    this.p2pNode = p2pNode;
  }

  /**
   * Returns the full profiles of the given archaeologist addresses. If no addresses are provided,
   * returns the full profiles of all registered archaeologists.
   *
   * @param addresses - The addresses of the archaeologists to get the full profiles of.
   * @returns The full profiles of the given archaeologists.
   */
  async getFullArchProfiles(addresses?: string[]): Promise<ArchaeologistData[]> {
    try {
      if (!addresses) {
        addresses = (await safeContractCall(
          this.viewStateFacet,
          'getArchaeologistProfileAddresses',
          []
        )) as unknown as string[];
      }

      const archData = await getArchaeologists(this.subgraphUrl);

      const registeredArchaeologists = archData.map(arch => {
        const {
          successes,
          accusals,
          failures,
          address: archAddress,
          maximumResurrectionTime,
          freeBond,
          maximumRewrapInterval,
          minimumDiggingFeePerSecond,
          peerId,
          curseFee,
        } = arch;

        return {
          profile: {
            archAddress: archAddress as Address,
            peerId,
            successes: BigNumber.from(successes.length),
            accusals: BigNumber.from(accusals),
            failures: BigNumber.from(failures),
            maximumResurrectionTime: BigNumber.from(maximumResurrectionTime),
            freeBond: BigNumber.from(freeBond),
            maximumRewrapInterval: BigNumber.from(maximumRewrapInterval),
            minimumDiggingFeePerSecond: BigNumber.from(minimumDiggingFeePerSecond),
            curseFee: BigNumber.from(curseFee),
          },
          isOnline: false,
        };
      });

      let response: Response;
      // TODO: Get these env variables from SarcoClient config object (or hard code those that are not configurable)
      const onlineArchsUrl = 'https://api.encryptafile.com/online-archaeologists';
      const fetchOptions = {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      };

      if (window === undefined) {
        let fetch = require('isomorphic-fetch');
        response = await fetch(onlineArchsUrl, fetchOptions);
      } else {
        response = await fetch(onlineArchsUrl, fetchOptions);
      }

      const onlinePeerIds = (await response!.json()) as string[];

      for (let arch of registeredArchaeologists) {
        if (onlinePeerIds.includes(arch.profile.peerId)) {
          arch.isOnline = true;
        }
      }

      return registeredArchaeologists;
    } catch (e) {
      throw e;
    }
  }

  async dialArchaeologist(arch: ArchaeologistData): Promise<Connection> {
    try {
      // @ts-ignore
      const connection = (await this.p2pNode?.dial(getDialAddress(arch))) as Connection;
      if (!connection) throw Error('No connection obtained from dial');
      return connection;
    } catch (e) {
      throw {
        error: e,
        msg: 'Failed to dial archaeologist',
        code: ArchaeologistExceptionCode.CONNECTION_EXCEPTION,
        arch,
      };
    }
  }

  async hangUp(arch: ArchaeologistData) {
    // @ts-ignore
    return this.p2pNode?.hangUp(getDialAddress(arch));
  }

  async pingArchaeologist(
    arch: ArchaeologistData,
    onComplete: (latency: number | null) => void,
    pingTimeout: number = 5000
  ) {
    const couldNotConnect = setTimeout(() => {
      console.log(`${arch.toString()}: ping timeout!`);
      onComplete(null);
    }, pingTimeout);

    const peerIdString = arch.profile.peerId;
    console.log(`pinging ${peerIdString}`);

    // @ts-ignore
    const latency = await this.p2pNode?.ping(getDialAddress(arch));
    await this.hangUp(arch);

    if (!!latency) {
      clearTimeout(couldNotConnect);
      onComplete(latency);
    }
  }
}
