import { BigNumber, ethers } from 'ethers';
import { getArchaeologists } from './helpers/subgraph';
import { pipe } from 'it-pipe';
import { Libp2p } from 'libp2p';
import { ViewStateFacet__factory } from '@sarcophagus-org/sarcophagus-v2-contracts';
import { Multiaddr, multiaddr } from '@multiformats/multiaddr';
import { Connection } from '@libp2p/interface-connection';

import {
  ArchaeologistData,
  ArchaeologistExceptionCode,
  ArchaeologistNegotiationResponse,
  ArchaeologistNegotiationResult,
  ArchaeologistSignatureNegotiationParams,
  SarcophagusValidationError,
} from './types/archaeologist';
import { safeContractCall } from './helpers/safeContractCall';
import { Address } from './types';
import { getLowestResurrectionTime, getLowestRewrapInterval } from './helpers/archHelpers';
import { getCurrentTimeSec } from './helpers/misc';
import { NEGOTIATION_SIGNATURE_STREAM } from './libp2p_node/p2pNodeConfig';

/**
 * The ArchaeologistApi class provides a high-level interface for interacting with
 * archaeologists on the Sarcophagus V2 protocol.
 */
export class ArchaeologistApi {
  private viewStateFacet: ethers.Contract;
  private subgraphUrl: string;
  private p2pNode: Libp2p;
  private signer: ethers.Signer;

  constructor(diamondDeployAddress: string, signer: ethers.Signer, subgraphUrl: string, p2pNode: Libp2p) {
    this.subgraphUrl = subgraphUrl;
    this.viewStateFacet = new ethers.Contract(diamondDeployAddress, ViewStateFacet__factory.abi, signer);
    this.p2pNode = p2pNode;
    this.signer = signer;
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

  async initiateSarcophagusNegotiation(selectedArchaeologists: ArchaeologistData[], isRetry = false) {
    console.log('starting the negotiation');
    const lowestRewrapInterval = getLowestRewrapInterval(selectedArchaeologists);
    const lowestResurrectionTime = getLowestResurrectionTime(selectedArchaeologists);

    const negotiationTimestamp = (await getCurrentTimeSec(this.signer.provider!)) * 1000;

    let archaeologistSignaturesCount = 0;
    let archaeologistPublicKeysCount = 0;
    const negotiationResult = new Map<string, ArchaeologistNegotiationResult>([]);

    await Promise.all(
      selectedArchaeologists.map(async arch => {
        // if (cancelToken.cancelled) return;

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

        const negotiationParams: ArchaeologistSignatureNegotiationParams = {
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
                  message: this.processDeclinedSignatureCode(
                    response.error.code as SarcophagusValidationError,
                    arch.profile.archAddress
                  ),
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

                archaeologistSignaturesCount++;
                archaeologistPublicKeysCount++;
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
}
