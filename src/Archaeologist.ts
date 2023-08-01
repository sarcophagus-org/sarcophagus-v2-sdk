import { Connection } from '@libp2p/interface-connection';
import { Multiaddr, multiaddr } from '@multiformats/multiaddr';
import { ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { BigNumber, ethers } from 'ethers';
import { pipe } from 'it-pipe';
import { Libp2p } from 'libp2p';
import { getArchaeologists } from './helpers/subgraph';

import { Utils } from './Utils';
import { safeContractCall } from './helpers/safeContractCall';
import { NEGOTIATION_SIGNATURE_STREAM } from './libp2p_node/p2pNodeConfig';
import {
  ArchaeologistCurseNegotiationParams,
  ArchaeologistData,
  ArchaeologistExceptionCode,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult, ArchaeologistProfile,
  SarcophagusValidationError,
} from './types/archaeologist';
import { getLowestResurrectionTime, getLowestRewrapInterval } from './helpers';

/**
 * The ArchaeologistApi class provides a high-level interface for interacting with
 * archaeologists on the Sarcophagus V2 protocol.
 */
export class Archaeologist {
  private readonly viewStateFacet: ethers.Contract;
  private subgraphUrl: string;
  private p2pNode: Libp2p;
  private signer: ethers.Signer;
  private utils: Utils;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, subgraphUrl: string, p2pNode: Libp2p, utils: Utils) {
    this.subgraphUrl = subgraphUrl;
    this.viewStateFacet = new ethers.Contract(diamondDeployAddress, ViewStateFacet__factory.abi, signer);
    this.p2pNode = p2pNode;
    this.signer = signer;
    this.utils = utils;
  }

  private getDialAddress(arch: ArchaeologistData): Multiaddr {
    // If peerIdParsed has 2 elements, it has a domain and peerId <domain>:<peerId>
    // Otherwise it is just <peerId>
    const peerIdParsed = arch.profile.peerId.split(':');

    if (peerIdParsed.length === 2) {
      return multiaddr(`/dns4/${peerIdParsed[0]}/tcp/443/wss/p2p/${peerIdParsed[1]}`);
    } else {
      throw new Error('PeerId is not valid');
    }
  }

  private processDeclinedSignatureCode(code: SarcophagusValidationError, archAddress: string): string {
    switch (code) {
      case SarcophagusValidationError.DIGGING_FEE_TOO_LOW:
        return `Digging fee set for ${archAddress} is too low`;
      case SarcophagusValidationError.INVALID_TIMESTAMP:
        return `${archAddress} rejected negotiation time`;
      case SarcophagusValidationError.MAX_REWRAP_INTERVAL_TOO_LARGE:
        return `Rewrap interval set for ${archAddress} is too large`;
      case SarcophagusValidationError.CURSE_FEE_TOO_LOW:
        return 'Curse fee provided is too low';
      case SarcophagusValidationError.MAX_RESURRECTION_TIME_TOO_LARGE:
        return 'Max resurrection time is too high';
      case SarcophagusValidationError.UNKNOWN_ERROR:
      default:
        return `Exception while waiting for signature from ${archAddress}`;
    }
  }

  /**
   * Returns the peerIds of the archaeologists that are currently online.
   */
  private async getOnlineArchPeerIds(): Promise<string[]> {
    let response: Response;
    const onlineArchsUrl = 'https://api.encryptafile.com/online-archaeologists';
    const fetchOptions = {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    };

    // if (window === undefined) {
    //   let fetch = require('isomorphic-fetch');
    //   response = await fetch(onlineArchsUrl, fetchOptions);
    // } else {
    response = await fetch(onlineArchsUrl, fetchOptions);
    // }

    const onlinePeerIds = (await response!.json()) as string[];
    return onlinePeerIds;
  }

  /**
   * Returns the full profiles of the given archaeologist addresses. If no addresses are provided,
   * returns the full profiles of all registered archaeologists.
   *
   * @param addresses - The addresses of the archaeologists to get the full profiles of.
   * @param filterOffline - Whether to filter out offline archaeologists.
   *
   * @returns The full profiles of the given archaeologists.
   */
  async getFullArchProfiles(addresses?: string[], filterOffline = false): Promise<ArchaeologistData[]> {
    try {
      if (!addresses) {
        addresses = (await safeContractCall(
          this.viewStateFacet,
          'getArchaeologistProfileAddresses',
          []
        )) as unknown as string[];
      }

      addresses = addresses.map(a => a.toLowerCase());
      const archSubgraphData =
        (await getArchaeologists(this.subgraphUrl))
          .filter(arch => addresses!.includes(arch.address));

      const profiles = (await safeContractCall(
        this.viewStateFacet,
        'getArchaeologistProfiles',
        [addresses]
      )) as unknown as ArchaeologistProfile[];

      const registeredArchaeologists = archSubgraphData.map(arch => {
        const {
          successes,
          accusals,
          failures,
          address: archAddress,
          maximumResurrectionTime,
          maximumRewrapInterval,
          minimumDiggingFeePerSecond,
          peerId,
          curseFee,
        } = arch;

        const freeBond = profiles.find(p => p.peerId === peerId)!.freeBond

        return {
          profile: {
            archAddress,
            peerId,
            successes: BigNumber.from(successes.length),
            accusals: BigNumber.from(accusals),
            failures: BigNumber.from(failures),
            maximumResurrectionTime: BigNumber.from(maximumResurrectionTime),
            freeBond: freeBond,
            maximumRewrapInterval: BigNumber.from(maximumRewrapInterval),
            minimumDiggingFeePerSecond: BigNumber.from(minimumDiggingFeePerSecond),
            curseFee: BigNumber.from(curseFee),
          },
          isOnline: false,
        };
      });

      const onlinePeerIds = await this.getOnlineArchPeerIds();

      for (let arch of registeredArchaeologists) {
        if (onlinePeerIds.includes(arch.profile.peerId)) {
          arch.isOnline = true;
        }
      }

      return filterOffline ? registeredArchaeologists.filter(a => a.isOnline) : registeredArchaeologists;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Dials the given archaeologist and returns the connection.
   *
   * @param arch - The archaeologist to dial.
   * @returns The connection to the archaeologist.
   *
   * @throws if the archaeologist cannot be dialed.
   * @throws if the archaeologist does not have a valid peerId ("<domain>:<p2pPeerId>").
   */
  async dialArchaeologist(arch: ArchaeologistData): Promise<Connection> {
    try {
      // @ts-ignore
      const connection = (await this.p2pNode?.dial(this.getDialAddress(arch))) as Connection;
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

  /**
   * Hangs up the connection to the given archaeologist.
   *
   * @param arch - The archaeologist to hang up.
   */
  async hangUp(arch: ArchaeologistData) {
    // @ts-ignore
    return this.p2pNode?.hangUp(this.getDialAddress(arch));
  }

  /**
   * Pings the given archaeologist. Completes with the latency of the ping. If the archaeologist
   * cannot be pinged, completes with null.
   *
   * @param arch - The archaeologist to ping.
   * @param onComplete - Callback function to be called after the archaeologist has been pinged. Latency is passed as an argument.
   * @param pingTimeout - The timeout for the ping.
   *
   * @throws if the archaeologist cannot be dialed.
   * @throws if the archaeologist does not have a valid peerId ("<domain>:<p2pPeerId>").
   */
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
    const latency = await this.p2pNode?.ping(this.getDialAddress(arch));
    await this.hangUp(arch);

    if (!!latency) {
      clearTimeout(couldNotConnect);
      onComplete(latency);
    }
  }

  /**
   * Initiates a negotiation with the given archaeologists. Completes with a map of the archaeologists'
   * signatures and public keys, or with a map of the archaeologists' exceptions if the archaeologists
   * decline the negotiation.
   *
   * **NOTE:** Not all archaeologists are guaranteed to complete the negotiation. If an archaeologist
   * declines the negotiation, is suddenly offline, or otherwise throws an exception during the negotiation,
   * it will be included in the returned map with a defined exception. You can retry the negotiation with the
   * archaeologists that threw exceptions by passing them to `initiateSarcophagusNegotiation`
   * with the `isRetry` flag set to true. This will attempt to re-dial the archaeologists that threw exceptions
   * and retry the negotiation with them.
   *
   * @param selectedArchaeologists - The archaeologists to negotiate with.
   * @param isRetry - Whether this is a retry of a previous negotiation.
   *
   * @returns A map of the archaeologists' signatures and public keys, or a map of the archaeologists' exceptions.
   *
   * @throws if the archaeologists do not have valid peerIds ("<domain>:<p2pPeerId>").
   * @throws if the archaeologists' streams throw an exception.
   */
  async initiateSarcophagusNegotiation(selectedArchaeologists: ArchaeologistData[], isRetry = false) {
    console.log('starting the negotiation');
    const lowestRewrapInterval = getLowestRewrapInterval(selectedArchaeologists);
    const lowestResurrectionTime = getLowestResurrectionTime(selectedArchaeologists);

    const negotiationTimestamp = (await this.utils.getCurrentTimeSec(this.signer.provider!)) * 1000;

    const negotiationResult = new Map<string, ArchaeologistNegotiationResult>([]);

    await Promise.all(
      selectedArchaeologists.map(async arch => {
        if (!arch.connection) {
          console.log(`${arch.profile.peerId} connection is undefined`);
          negotiationResult.set(arch.profile.peerId, {
            peerId: arch.profile.peerId,
            exception: {
              code: ArchaeologistExceptionCode.CONNECTION_EXCEPTION,
              message: 'No connection to archaeologist',
            },
          });

          if (isRetry && arch.fullPeerId) {
            arch.connection = await this.dialArchaeologist(arch);
            if (!arch.connection) return;
          } else {
            return;
          }
        }

        const negotiationParams: ArchaeologistCurseNegotiationParams = {
          diggingFeePerSecond: arch.profile.minimumDiggingFeePerSecond.toString(),
          maxRewrapInterval: lowestRewrapInterval,
          maximumResurrectionTime: lowestResurrectionTime,
          timestamp: negotiationTimestamp,
          curseFee: arch.profile.curseFee.toString(),
        };

        const outboundMsg = JSON.stringify(negotiationParams);

        try {
          const stream = await arch.connection.newStream(NEGOTIATION_SIGNATURE_STREAM);

          await pipe([new TextEncoder().encode(outboundMsg)], stream, async (source: any) => {
            for await (const data of source) {
              const dataStr = new TextDecoder().decode(data.subarray());
              const response: ArchaeologistNegotiationResponse = JSON.parse(dataStr);

              if (response.error) {
                console.log(`error response from arch: \n${response.error.message}`);
                const exception = {
                  code: ArchaeologistExceptionCode.DECLINED_SIGNATURE,
                  message: this.processDeclinedSignatureCode(response.error.code, arch.profile.archAddress),
                };

                negotiationResult.set(arch.profile.peerId, {
                  peerId: arch.profile.peerId,
                  exception,
                });
              } else {
                negotiationResult.set(arch.profile.peerId, {
                  peerId: arch.profile.peerId,
                  publicKey: response.publicKey,
                  signature: response.signature,
                });
              }
            }
          })
            .catch(e => {
              const message = `Exception occurred in negotiation stream for: ${arch.profile.archAddress}`;
              console.error(`Stream exception on ${arch.profile.peerId}`, e);

              negotiationResult.set(arch.profile.peerId, {
                peerId: arch.profile.peerId,
                exception: {
                  code: ArchaeologistExceptionCode.STREAM_EXCEPTION,
                  message,
                },
              });
            })
            .finally(() => stream.close());
        } catch (e) {
          throw Error(`stream exception: ${e}`);
        }
      })
    ).catch(error => {
      throw Error(`Error retrieving arch signatures ${error}`);
    });

    return [negotiationResult, negotiationTimestamp] as const;
  }

  /**
   * Returns the estimated total digging fees, and protocol fee,
   * that the embalmer will be due to pay.
   */
  async getTotalFeesInSarco(archaeologists: ArchaeologistData[], resurrectionTimestamp: number, timestampMs: number) {
    const protocolFeeBasePercentage = (await safeContractCall(
      this.viewStateFacet,
      'getProtocolFeeBasePercentage',
      []
    )) as unknown as BigNumber;

    const totalDiggingFees = this.calculateProjectedDiggingFees(archaeologists, resurrectionTimestamp, timestampMs);

    const protocolFee = totalDiggingFees.div(BigNumber.from(10000).div(protocolFeeBasePercentage));

    return {
      totalDiggingFees,
      formattedTotalDiggingFees: this.utils.formatSarco(totalDiggingFees.toString()),
      protocolFee,
      protocolFeeBasePercentage,
    } as const;
  }

  /**
   * Returns the smallest maximumResurrectionTime and maximumRewrapInterval values
   * from the profiles of the archaeologists provided
   */
  getLowestResurrectionTimeAndRewrapInterval(archaeologists: ArchaeologistData[]) {
    let lowestRewrapInterval = Number(archaeologists[0].profile.maximumRewrapInterval);
    let lowestResurrectiontime = Number(archaeologists[0].profile.maximumResurrectionTime);

    archaeologists.slice(1).forEach(arch => {
      const resTime = Number(arch.profile.maximumResurrectionTime);
      const rewrapInterval = Number(arch.profile.maximumRewrapInterval);
      if (resTime < lowestResurrectiontime) {
        lowestResurrectiontime = resTime;
      }

      if (rewrapInterval < lowestRewrapInterval) {
        lowestRewrapInterval = rewrapInterval;
      }
    });

    return { lowestRewrapInterval, lowestResurrectiontime };
  }

  /**
   * Returns the total digging fees owed to the archaeologist, given a resurrection time and current timestamp.
   **/
  calculateDiggingFees(archaeologist: ArchaeologistData, resurrectionTime: number, timestampMs: number): BigNumber {
    const nowSec = Math.floor(timestampMs / 1000);
    const resurrectionTimeSec = Math.floor(resurrectionTime / 1000);

    if (resurrectionTimeSec <= nowSec) {
      throw new Error(`resurrectionTime (${resurrectionTime}) must be larger than timestampMs (${timestampMs}))`);
    }

    return archaeologist.profile.minimumDiggingFeePerSecond.mul(resurrectionTimeSec - nowSec);
  }

  /**
   * Returns the total projected digging fees owed to the archaeologist, given a resurrection time and current timestamp.
   *
   * @param archaeologists
   * @param resurrectionTimestamp The timestamp of the resurrection in ms
   * @param timestampMs The current timestamp in ms
   *
   * @returns The total projected digging fees as a string
   */
  calculateProjectedDiggingFees(
    archaeologists: ArchaeologistData[],
    resurrectionTimestamp: number,
    timestampMs: number
  ): BigNumber {
    if (resurrectionTimestamp === 0) return ethers.constants.Zero;
    const totalDiggingFeesPerSecond = archaeologists.reduce(
      (acc, curr) => acc.add(curr.profile.minimumDiggingFeePerSecond),
      ethers.constants.Zero
    );

    const resurrectionSeconds = Math.floor(resurrectionTimestamp / 1000);
    const nowSeconds = Math.floor(timestampMs / 1000);

    return totalDiggingFeesPerSecond.mul(resurrectionSeconds - nowSeconds);
  }
}
