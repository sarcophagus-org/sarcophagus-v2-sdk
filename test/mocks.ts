import { NodeSarcoClient } from '../src/NodeSarcoClient';
import { privateKey } from './api/test-data';

jest.mock('../src/NodeSarcoClient');
const NodeSarcoClientMock = NodeSarcoClient as jest.Mocked<typeof NodeSarcoClient>;
export const mockSarcoClient = new NodeSarcoClientMock({ privateKey, providerUrl: 'mockUrl', chainId: 5 });
