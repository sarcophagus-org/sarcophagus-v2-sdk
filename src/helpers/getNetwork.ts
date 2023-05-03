import { Signer, ethers } from 'ethers';

export async function getNetwork(signer: Signer): Promise<ethers.providers.Network> {
  const provider = signer.provider;
  if (provider) {
    return await provider.getNetwork();
  } else {
    throw new Error('Signer does not have a provider');
  }
}
