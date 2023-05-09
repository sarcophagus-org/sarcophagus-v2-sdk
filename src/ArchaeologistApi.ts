import { BigNumber, ethers } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { getArchaeologists } from './helpers/subgraph';

import { ArchaeologistData, ArchaeologistExceptionCode } from './types/archaeologist';
import { ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { safeContractCall } from './helpers/safeContractCall';
import { PeerId } from '@libp2p/interface-peer-id';
import { Multiaddr, multiaddr } from '@multiformats/multiaddr';
import { Connection } from '@libp2p/interface-connection';

const goerliDiamondAddress = '0x6B84f17bbfCe26776fEFDf5cF039cA0E66C46Caf';

/**
 * The ArchaeologistApi class provides a high-level interface for interacting with
 * archaeologists on the Sarcophagus V2 protocol.
 */
export class ArchaeologistApi {
  sarcoClient: SarcoClient;
  viewStateFacet: ethers.Contract;

  constructor(sarcoClient: SarcoClient) {
    this.sarcoClient = sarcoClient;
    this.viewStateFacet = new ethers.Contract(
      goerliDiamondAddress,
      ViewStateFacet__factory.abi,
      this.sarcoClient.signer
    );
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

      const archData = await getArchaeologists();

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
            archAddress,
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
      const onlineArchsUrl = `${process.env.REACT_APP_ARCH_MONITOR}/online-archaeologists`;
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

  getDialAddress(arch: ArchaeologistData): PeerId | Multiaddr {
    // If peerIdParsed has 2 elements, it has a domain and peerId <domain>:<peerId>
    // Otherwise it is just <peerId>
    const peerIdParsed = arch.profile.peerId.split(':');

    if (peerIdParsed.length === 2) {
      return multiaddr(`/dns4/${peerIdParsed[0]}/tcp/443/wss/p2p/${peerIdParsed[1]}`);
    } else {
      return arch.fullPeerId!;
    }
  }

  dialPeerIdOrMultiAddr(arch: ArchaeologistData, isPing?: boolean): Promise<Connection> | Promise<number> | undefined {
    const dialAddr = this.getDialAddress(arch);

    return isPing ? libp2pNode?.ping(dialAddr) : libp2pNode?.dial(dialAddr);
  }

  hangUpArch(arch: ArchaeologistData) {
    const dialAddr = this.getDialAddress(arch);
    return libp2pNode?.hangUp(dialAddr);
  }

  async dialArchaeologist(arch: ArchaeologistData): Promise<Connection | ArchaeologistExceptionCode> {
    try {
      const connection = (await this.dialPeerIdOrMultiAddr(arch)) as Connection;
      if (!connection) throw Error('No connection obtained from dial');
      return connection;
    } catch (e) {
      return ArchaeologistExceptionCode.CONNECTION_EXCEPTION;
    }
  }

  async pingArchaeologist(arch: ArchaeologistData, onComplete: Function, pingTimeout: number = 5000) {
    const peerIdString = arch.profile.peerId;
    const couldNotConnect = setTimeout(() => {
      console.log('ping timeout!');
      onComplete();
    }, pingTimeout);

    console.log(`pinging ${peerIdString}`);

    const latency = await this.dialPeerIdOrMultiAddr(arch, true);
    await this.hangUpArch(arch);

    if (!!latency) {
      clearTimeout(couldNotConnect);
      onComplete();
    }
  }
}
