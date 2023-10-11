# Sarcophagus V2 SDK

The Sarcophagus V2 SDK is a TypeScript library designed to simplify the interaction with the Sarcophagus V2 protocol. This SDK provides a high-level interface for developers to easily interact with the protocol's smart contracts and related services.

## Features

- Easy-to-use interface
- Supports custom signer and provider configurations
- Provides utility functions for common tasks

## Documentation

Read more about how to use the Sarcophagus V2 SDK [here](https://sarcophagus-org.github.io/sarcophagus-v2-sdk/index.html).

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

## Usage

Here's a basic example of using the Sarcophagus V2 SDK in a NodeJS project:

```typescript
import { NodeSarcoClient } from '"@sarcophagus-org/sarcophagus-v2-sdk';

// Initialize the client with a custom provider and signer
const sarco = new NodeSarcoClient({ privateKey, providerUrl, chainId, etherscanApiKey, zeroExApiKey });

// 1. Initialize the sdk
try {
  await sarco.init();
} catch (error) {
  console.error('Failed to initialize SDK');
}

// 2. Get archaeologist profiles
const archaeologists = await sarco.archaeologist
  .getFullArchProfiles({ addresses, filterOffline: true })
  .catch(error => {
    console.error('Failed to get archaeologist profiles');
  });

archaeologists.forEach((arch, i) => {
  console.log(`  ${i + 1}. ${arch.profile.archAddress}`);
});

// 3. Dial and connect to archaeologists
await Promise.all(
  archaeologists.map(async arch => {
    try {
      const connection = await sarco.archaeologist.dialArchaeologist(arch);
      arch.connection = connection;
    } catch (error) {
      console.error(`Failed to dial archaeologist ${arch.profile.archAddress}`);
    }
  })
).catch(error => {
  console.error('Failed to dial archaeologists');
});

console.log(`Successfully connected to ${archaeologists.length} archaeologists`);
```

## Local Development

The SDK may be tested locally by cloning the SDK repository and linking it to your project.

```
git clone git@github.com:sarcophagus-org/sarcophagus-v2-sdk.git
cd sarcophagus-v2-sdk
npm run build
npm link
cd path/to/your/project
npm link sarcophagus-v2-sdk
```

Then it may be imported as if it were added to the package.json.

## Contributing

We welcome contributions to the SDK. If you'd like to contribute, please submit an issue or open a pull request.

## License

This project is licensed under The Unlicense license.
