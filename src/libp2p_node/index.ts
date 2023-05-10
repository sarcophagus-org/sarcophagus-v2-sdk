import { Libp2p, createLibp2p } from 'libp2p';
import { p2pNodeConfig } from './p2pNodeConfig';

// const onPeerDiscovery = (evt: CustomEvent<PeerInfo>) => {
// const peerId = evt.detail.id;
// dispatch(setArchaeologistOnlineStatus(peerId.toString(), true));
// dispatch(setArchaeologistFullPeerId(peerId));
// TODO -- temporarily removed while we have the 20 second discovery limit
// if this continues to run, the archs will disappear
// if (heartbeatTimeouts[peerId.toString()]) {
//   clearTimeout(heartbeatTimeouts[peerId.toString()]);
//   heartbeatTimeouts[peerId.toString()] = undefined;
// }
//
// heartbeatTimeouts[peerId.toString()] = setTimeout(() => {
//   console.log(`No longer online: ${peerId.toString()}`);
//   dispatch(setArchaeologistOnlineStatus(peerId.toString(), false));
// }, pingThreshold);
// };

// const onPeerDisconnect = (evt: CustomEvent<Connection>) => {
// const peerId = evt.detail.remotePeer.toString();
// dispatch(setArchaeologistConnection(peerId, undefined));
// };

// const addPeerDiscoveryEventListener = (libp2pNode: Libp2p): void => {
//   libp2pNode.addEventListener('peer:discovery', onPeerDiscovery);

//   // TODO: Remove this once we refactor how libp2p works
//   // Sets a limited time discovery period by removing the listener after a certain period of
//   // time. This is a temporary fix to prevent the discovery listener from causing components to
//   // render endlessly.
//   setTimeout(() => {
//     libp2pNode.removeEventListener('peer:discovery', onPeerDiscovery);
//   }, 20_000);
// };

const idTruncateLimit = 5;

export const bootLip2p = async (): Promise<Libp2p> => {
  const newLibp2pNode = await createLibp2p(p2pNodeConfig);
  await newLibp2pNode.start();
  console.log(`LibP2P node starting with peerID: ${newLibp2pNode.peerId.toString()}`);

  newLibp2pNode.connectionManager.addEventListener("peer:connect", async evt => {
    const peerId = evt.detail.remotePeer.toString();
    console.log(
      `Connection established to ${peerId.slice(peerId.length - idTruncateLimit)}`,
      true
    );
  });

  newLibp2pNode.connectionManager.addEventListener("peer:disconnect", evt => {
    const peerId = evt.detail.remotePeer.toString();
    console.log(
      `Connection dropped from ${peerId.slice(peerId.length - idTruncateLimit)}`,
      true
    );
  });

  return newLibp2pNode;

  // TODO: re-add once peer discovery is re-added
  // addPeerDiscoveryEventListener(newLibp2pNode);
  // addPeerDisconnectEventListener(newLibp2pNode);
};
