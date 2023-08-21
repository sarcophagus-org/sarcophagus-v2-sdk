import { object, string, number, mixed, InferType, ArraySchema } from 'yup';
import { BigNumber } from 'ethers';

export const nodeSarcoClientSchema = object({
  privateKey: string().required(),
  providerUrl: string().required(),
  chainId: number().required(),
  etherscanApiKey: string(),
  zeroExApiKey: string(),
});

export const sarcoClientInitSchema = object({
  chainId: number().required(),
  bundlrPublicKey: string(),
  etherscanApiKey: string(),
  zeroExApiKey: string(),
});

export const sarcophagusSettingsSchema = object({
  name: string().required(),
  recipientAddress: string().required(),
  creationTime: number().required().positive().integer(),
  resurrectionTime: number().required().positive().integer(),
  threshold: number().required().positive().integer(),
  maximumRewrapInterval: number().required().positive().integer(),
  maximumResurrectionTime: number().required().positive().integer(),
});

const archaeologistSettingsSchema = object({
  publicKey: string().required(),
  archAddress: string().required(),
  diggingFeePerSecond: mixed<BigNumber>().required(),
  curseFee: mixed<BigNumber>().required(),
  v: number().required().positive().integer(),
  r: string().required(),
  s: string().required(),
});

export const archaeologistSettingsArraySchema = new ArraySchema().of(archaeologistSettingsSchema).required();

export type NodeSarcoClientConfig = InferType<typeof nodeSarcoClientSchema>;
export type SarcophagusSettings = InferType<typeof sarcophagusSettingsSchema>;
export type ArchaeologistSettings = InferType<typeof archaeologistSettingsSchema>;
export type SarcoInitParams = InferType<typeof sarcoClientInitSchema>;
