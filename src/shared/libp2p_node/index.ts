import { Libp2p, createLibp2p } from 'libp2p';
import { p2pNodeConfig } from './p2pNodeConfig';

const idTruncateLimit = 5;

export const bootLip2p = async (): Promise<Libp2p> => {
  const newLibp2pNode = await createLibp2p(p2pNodeConfig);

  newLibp2pNode.connectionManager.addEventListener('peer:connect', async evt => {
    const peerId = evt.detail.remotePeer.toString();
    console.log(`Connection established to ${peerId.slice(peerId.length - idTruncateLimit)}`, true);
  });

  newLibp2pNode.connectionManager.addEventListener('peer:disconnect', evt => {
    const peerId = evt.detail.remotePeer.toString();
    console.log(`Connection dropped from ${peerId.slice(peerId.length - idTruncateLimit)}`, true);
  });

  return newLibp2pNode;
};
