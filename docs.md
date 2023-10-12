##

The Sarcophagus V2 SDK is a TypeScript library designed to simplify the interaction with the Sarcophagus V2 protocol. This SDK provides a high-level interface for developers to easily interact with the protocol's smart contracts and related services.

## Installation

To install the SDK, run the following command in your project directory:

For web environments:

```
npm install @sarcophagus-org/sarcophagus-v2-sdk-client
```

For Node.js environments:

```
npm install @sarcophagus-org/sarcophagus-v2-sdk
```

<br>
<br>

# Typical Usage

The Sarcophagus V2 SDK is designed to be used in both Web browser and Node.js environments, so initializing the sdk in either
environment differs slightly, however, the usage of the sdk is the same in both environments.

## Web Browser Environment

The sdk exposes a [singleton](./variables/sarco.html) that you can import and use in your application:

```typescript
import { sarco } from '@sarcophagus-org/sarcophagus-v2-sdk-client';
```

## Node.js Environment

The SDK exposes a [`NodeSarcoClient`](./classes/NodeSarcoClient.html) class that should be instantiated to use in your NodeJS application:

```typescript
import { NodeSarcoClient } from '@sarcophagus-org/sarcophagus-v2-sdk';
// `privateKey` is the private key of the wallet you will use to interact with the Sarcophagus protocol
const sarco = new NodeSarcoClient({ chainId, privateKey, providerUrl });
```

Before you can call any methods on the sdk, you must initialize it with a provider and signer.
This will also boot up a LibP2P node that will be used to communicate with archaeologists registered on the Sarcophagus network.

```typescript
sarco
  .init({
    chainId: 1,
    providerUrl: 'rpc/provider/url',
    etherscanApiKey: 'etherscanApiKey',
  })
  .then(() => console.log('SDK initialized!'));

// Just `sarco.init()` for `NodeSarcoClient`
```

<br>

The most common use, and the most complex part, of the Sarcophagus V2 SDK is [creating a sarcophagus](./classes/SarcophagusApi.html#createSarcophagus):

```typescript
// Prepare your Sarcophagus
const name = 'My Sarcophagus';
const recipientAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const resurrectionTimestamp = 1620000000;
const file = new File(['sarcophagus file'], 'sarcophagus.txt', {
  type: 'text/plain',
});

// Select the archaeologists you want to use
const registeredArchaeologists = await sarco.archaeologist.getFullArchProfiles();
const selectedArchaeologists = registeredArchaeologists.slice(0, 3);

// Dial the selected archaeologists
for await (const arch of selectedArchaeologists) {
  const peerIdString = arch.profile.peerId;
  try {
    const connection = await sarco.archaeologist.dialArchaeologist(arch);
    if (!connection) throw Error('No connection obtained from dial');
    arch.connection = connection;
  } catch (e) {
    throw Error('Could not establish a connection');
  }
}

// Request signatures and public keys from the selected archaeologists. This effectively establishes an agreement between each
// archaeologist and the embalmer. The archaeologist agrees to resurrect the sarcophagus at the specified time
// from `negotiationTimestamp`, and you agree to pay them their fee as specified in their profile.
const [negotiationResult, negotiationTimestamp] = await sarco.archaeologist.initiateSarcophagusNegotiation(
  selectedArchaeologists,
  Math.floor(resurrectionTimestamp / 1000)
);

const archaeologistSignatures = new Map<`0x${string}` string>([]);
const archaeologistPublicKeys = new Map<`0x${string}` string>([]);

selectedArchaeologists.forEach(arch => {
  const res = negotiationResult.get(arch.profile.peerId)!;
  if (res.exception) {
    console.log('arch exception:', arch.profile.archAddress, res.exception);
  } else {
    archaeologistPublicKeys.set(arch.profile.archAddress, res.publicKey!);
    archaeologistSignatures.set(arch.profile.archAddress, res.signature!);
  }
});

if (archaeologistPublicKeys.size !== selectedArchaeologists.length) {
  throw Error('Not enough public keys');
}

if (archaeologistSignatures.size !== selectedArchaeologists.length) {
  throw Error('Not enough signatures');
}

// At least this many archaeologists must be present in order to resurrect the sarcophagus.
// Generally, the more archaeologists you select, the more secure your sarcophagus will be.
// But keep in mind that the more archaeologists you select, the more expensive it will be to resurrect the sarcophagus,
// and the more chance there will be that one of the archaeologists will be unavailable to resurrect the sarcophagus.
// Try to choose archaeologists that you can be confident will be available at the time of resurrection.
const requiredArchaeologists = selectedArchaeologists.length;

// Upload the file to Arweave
const { publicKey, privateKey } = sarco.utils.generateKeyPair();
 const uploadPromise = sarco.api.uploadFileToArweave({
    file,
    archaeologistPublicKeys: Array.from(archaeologistPublicKeys.values()),
    recipientPublicKey,
    shares: selectedArchaeologists.length,
    threshold: requiredArchaeologists,
    onStep: (step: string) => {
        console.log('Processing step: ', step);
    },
    onUploadChunk: (chunkedUploader: any, chunkedUploadProgress: number) => {
        console.log('Uploading chunk: ', chunkedUploadProgress);
    },
    onUploadChunkError: (msg: string) => {
        console.error(msg);
    },
    onUploadComplete: (uploadId: string) => {
        console.log('Upload complete. `arweaveTxId`: ', uploadId);
        // As this is a callback, you will need to persist `arweaveTxId` somewhere so that you can use it later
        // in `formatSubmitSarcophagusArgs`
    },
    payloadPrivateKey: privateKey,
    payloadPublicKey: publicKey,
});

// Process and format the arguments for the `createSarcophagus` method
const { submitSarcophagusArgs } = sarco.api.formatSubmitSarcophagusArgs({
    name,
    recipientAddress,
    resurrectionTimestamp,
    selectedArchaeologists,
    requiredArchaeologists,
    negotiationTimestamp,
    archaeologistPublicKeys,
    archaeologistSignatures,
    arweaveTxId,
});

const tx = await sarco.api.createSarcophagus(...submitSarcophagusArgs);
console.log('Sarcophagus created!! Transaction hash: ', tx.hash);
```
