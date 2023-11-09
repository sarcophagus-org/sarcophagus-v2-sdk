# Sarcophagus V2 SDK

The Sarcophagus V2 SDK is a TypeScript library designed to simplify the interaction with the Sarcophagus V2 protocol. This SDK provides a high-level interface for developers to easily interact with the protocol's smart contracts and related services.

## Features

- Easy-to-use interface
- Supports custom signer and provider configurations
- Provides utility functions for common tasks

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

## Documentation

Read more about how to use the Sarcophagus V2 SDK [here](https://sarcophagus-org.github.io/sarcophagus-v2-sdk/index.html).

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

## Deployment
To deploy a new version of the SDK:
1. Increment the package version in package.json (i.e. `"version": "0.2.37"`)
2. Merge code into the `main` branch
3. Create & Publish a new release
- The release will require a new tag, you can create the tag in the release
- As a naming convention for the release, name the tag the SDK version (i.e. 0.3.37), and also name the release the same name (0.3.37).

Once the release is published, the SDK packages will be automatically built with a github action and published to npm. 

## Contributing

We welcome contributions to the SDK. If you'd like to contribute, please submit an issue or open a pull request.

## License

This project is licensed under The Unlicense license.
