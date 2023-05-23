import { ethers } from 'ethers';
import { ArchaeologistSettings, SarcophagusSettings } from '../../src/helpers/validation';

export const sarcoId = 'test-id';
export const arweaveTxId = 'test-tx-id';
export const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';

export const defaultSarcophagusSettings: SarcophagusSettings = {
  name: 'Test Sarcophagus',
  recipientAddress: '0x0123456789012345678901234567890123456789',
  creationTime: Date.now(),
  resurrectionTime: Date.now() + 60 * 60 * 1000, // 1 hour later
  threshold: 2,
  maximumRewrapInterval: 60 * 60 * 1000, // 1 hour
  maximumResurrectionTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week later
};

export const defaultArchaeologists: ArchaeologistSettings[] = [
  {
    publicKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
    archAddress: '0x0123456789012345678901234567890123456789',
    diggingFeePerSecond: ethers.BigNumber.from(1),
    curseFee: ethers.BigNumber.from(10),
    v: 27,
    r: '0x0123456789012345678901234567890123456789012345678901234567890123',
    s: '0x0123456789012345678901234567890123456789012345678901234567890123',
  },
  {
    publicKey: '0x0987654321098765432109876543210987654321098765432109876543210987',
    archAddress: '0x9876543210987654321098765432109876543210',
    diggingFeePerSecond: ethers.BigNumber.from(2),
    curseFee: ethers.BigNumber.from(20),
    v: 28,
    r: '0x0987654321098765432109876543210987654321098765432109876543210987',
    s: '0x0987654321098765432109876543210987654321098765432109876543210987',
  },
];
