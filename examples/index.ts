import 'dotenv/config';
import { BigNumber, ethers } from 'ethers';
import { ArchaeologistNegotiationResult, ChunkingUploader, NodeSarcoClient } from 'sarcophagus-v2-sdk';
import fetch from 'node-fetch';

globalThis.fetch = fetch as any;

// Set up environment variables
// Be sure to define these in your .env
const privateKey = process.env.PRIVATE_KEY ?? '';
const providerUrl = process.env.PROVIDER_URL ?? '';
const chainId = parseInt(process.env.CHAIN_ID) ?? 5;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY ?? '';

async function main() {
  // Define script parameters
  const negotiationAttemptCount = 5;
  const negotiationAttemptTimeout = 2000;

  // Define sarcophagus parameters
  const sarcophagusName = 'SDK Sarcophagus'; // the name of the sarcophagus
  const fileName = 'hello_world.txt'; // the name of the file to upload
  const fileContents = 'Hello World!'; // the contents of the file to upload
  const archaeologistAddresses = ['0x7cff7c3c1f150a59a202cf5ec1bb8b57908e385e']; // the addresses of the archaeologists to use
  const requiredArchaeologistCount = 1; // the number of archaeologists required to resurrect
  const resurrectionTime = Date.now() + 1000 * 60 * 60 * 24 * 7; // the resurrection time in milliseconds

  // Create random wallets for the payload and recipient just for this example
  const payloadWallet = ethers.Wallet.createRandom();
  const recipientWallet = ethers.Wallet.createRandom();

  // 1. Initialize SDK
  console.log('\n1. Initialize SDK');
  console.log('Initializing SDK...');
  const sarco = new NodeSarcoClient({ privateKey, providerUrl, chainId, etherscanApiKey });
  await sarco.init().catch(error => {
    console.error('Failed to initialize SDK');
    throw error;
  });

  // 2. Get archaeologist profiles
  console.log('\n2. Get Archaeologist Profiles');
  console.log('Getting archaeologist profiles...');
  const archaeologists = await sarco.archaeologist.getFullArchProfiles(archaeologistAddresses, false).catch(error => {
    console.error('Failed to get archaeologist profiles');
    throw error;
  });
  console.log(`Retrieved ${archaeologists.length} archaeologist profiles:`);
  archaeologists.forEach((arch, i) => {
    console.log(`  ${i + 1}. ${arch.profile.archAddress}`);
  });

  // 3. Dial and connect to archaeologists
  console.log('\n3. Dial Archaeologists');
  console.log('Dialing archaeologists...');
  await Promise.all(
    archaeologists.map(async arch => {
      const connection = await sarco.archaeologist.dialArchaeologist(arch).catch(error => {
        console.error(`Failed to dial archaeologist ${arch.profile.archAddress}`);
        throw error;
      });
      arch.connection = connection;
    })
  ).catch(error => {
    console.error('Failed to dial archaeologists');
    throw error;
  });
  console.log(`Successfully connected to ${archaeologists.length} archaeologists`);

  // 4. Initiate sarcophagus negotiation
  console.log('\n4. Initiate Sarcophagus Negotiation');
  console.log('Initiating sarcophagus negotiation...');
  // Retry up to 5 times
  let responses = [];
  let negotiationResult: Map<string, ArchaeologistNegotiationResult>;
  let negotiationTimestamp: number;
  for (let attempt = 0; attempt < negotiationAttemptCount; attempt++) {
    try {
      [negotiationResult, negotiationTimestamp] = await sarco.archaeologist.initiateSarcophagusNegotiation(
        archaeologists
      );
      responses = archaeologists.map(arch => negotiationResult.get(arch.profile.peerId)!);
      console.log('Negotiation successful');
      break; // If successful, break the loop
    } catch (error) {
      console.error('Attempt ' + (attempt + 1) + ': Failed to initiate sarcophagus negotiation');
      // If we've reached the max attempts, re-throw the error
      if (attempt === negotiationAttemptCount - 1) {
        throw error;
      }
      // Otherwise, wait a bit before retrying
      else {
        await new Promise(resolve => setTimeout(resolve, negotiationAttemptTimeout));
      }
    }
  }

  // 5. Upload file to Arweave
  console.log('\n5. Upload File to Arweave');
  console.log('Uploading file to Arweave...');
  function onStep(step: string) {}
  function onUploadChunk(chunkedUploader: ChunkingUploader, chunkedUploadProgress: number) {}
  function onUploadChunkError(msg: string) {}

  let uploadId = '';
  function onUploadComplete(_uploadId: string) {
    uploadId = _uploadId;
  }

  const archPublicKeys = responses.map(response => response.publicKey);
  const buffer = Buffer.from(fileContents, 'utf-8');
  const uploadArgs = {
    payloadData: {
      name: fileName,
      type: 'text/plain',
      data: buffer,
    },
    onStep,
    payloadPublicKey: payloadWallet.publicKey,
    payloadPrivateKey: payloadWallet.privateKey,
    recipientPublicKey: recipientWallet.publicKey,
    shares: archaeologistAddresses.length,
    threshold: requiredArchaeologistCount,
    archaeologistPublicKeys: archPublicKeys,
    onUploadChunk,
    onUploadChunkError,
    onUploadComplete,
  };
  await sarco.api.uploadFileToArweave(uploadArgs).catch(error => {
    console.error('Failed to upload file to Arweave');
    throw error;
  });

  // 6. Approve SARCO token (this approves max amount)
  console.log('\n6. Approve SARCO Token');
  console.log('Approving SARCO token...');
  const approveAmount = BigNumber.from(ethers.constants.MaxUint256);
  await sarco.token.approve(approveAmount).catch(error => {
    console.error('Failed to approve SARCO token');
    throw error;
  });
  console.log('Successfully approved SARCO token');

  // 7. Make contract call to create Sarcophagus
  console.log('\n7. Create Sarcophagus');
  console.log('Creating Sarcophagus...');
  const recipientState = {
    address: recipientWallet.address,
    publicKey: recipientWallet.publicKey,
    setByOption: null,
  };
  const selectedArchaeologists = archaeologists;
  const requiredArchaeologists = requiredArchaeologistCount;

  const archPublicKeysMap = new Map<string, string>();
  archaeologists.forEach((arch, i) => {
    archPublicKeysMap.set(arch.profile.archAddress, archPublicKeys[i]);
  });

  const archaeologistSignatures = new Map<string, string>();
  archaeologists.forEach((arch, i) => {
    archaeologistSignatures.set(arch.profile.archAddress, responses[i].signature);
  });

  const { submitSarcophagusArgs } = sarco.utils.formatSubmitSarcophagusArgs({
    name: sarcophagusName,
    recipientState,
    resurrection: resurrectionTime,
    selectedArchaeologists,
    requiredArchaeologists,
    negotiationTimestamp,
    archaeologistPublicKeys: archPublicKeysMap,
    archaeologistSignatures,
    arweaveTxId: uploadId,
  });
  const tx = await sarco.api.createSarcophagus(...submitSarcophagusArgs).catch(error => {
    console.error('Failed to create Sarcophagus');
    throw error;
  });

  console.log('Successfully created Sarcophagus!');
  console.log('TX hash: ', tx.hash);

  process.exit(0);
}

main();
