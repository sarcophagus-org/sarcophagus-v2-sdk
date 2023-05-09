import { BigNumber } from 'ethers';
import { SarcoClient } from './SarcoClient';
import { getArchaeologists } from './helpers/subgraph';

import { ArchaeologistData } from './types/archaeologist';

export class ArchaeologistApi {
  sarcoClient: SarcoClient;

  constructor(sarcoClient: SarcoClient) {
    this.sarcoClient = sarcoClient;
  }

  async getFullArchProfilesFromAddresses(addresses: string[]): Promise<ArchaeologistData[]> {
    try {
      if (addresses.length === 0) return [];

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
        method: "GET",
        headers: { "content-type": "application/json" },
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
      console.log('error loading archs', e);
      return [];
    }
  }
}
