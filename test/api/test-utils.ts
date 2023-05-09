import * as safeContractCallModule from '../../src/helpers/safeContractCall';

const createSafeContractCallMock = () => {
  const mock = jest.fn();
  jest.spyOn(safeContractCallModule, 'safeContractCall').mockImplementation(mock);
  return mock;
};

export const mockSafeContractCall = createSafeContractCallMock();
