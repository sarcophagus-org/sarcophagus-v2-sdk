import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { kadDHT } from '@libp2p/kad-dht';
import { webSockets } from '@libp2p/websockets';

// protocol names used to set up communication with archaeologist nodes
// these values must be the same for webapp's and archaeologist's node config
export const NEGOTIATION_SIGNATURE_STREAM = '/archaeologist-negotiation-signature';
export const DHT_PROTOCOL_PREFIX = '/archaeologist-service';

const dht = kadDHT({
  protocolPrefix: DHT_PROTOCOL_PREFIX,
  clientMode: false,
});

export const p2pNodeConfig: any = {
  transports: [webSockets()],
  connectionEncryption: [noise()],
  streamMuxers: [mplex()],
  peerDiscovery: [],
  dht,
  connectionManager: {
    autoDial: false,
    dialTimeout: 2000,
  },
};
