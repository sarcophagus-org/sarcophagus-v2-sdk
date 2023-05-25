import * as safeContractCallModule from '../../src/shared/helpers/safeContractCall';

const createSafeContractCallMock = () => {
  const mock = jest.fn();
  jest.spyOn(safeContractCallModule, 'safeContractCall').mockImplementation(mock);
  return mock;
};

export const mockSafeContractCall = createSafeContractCallMock();
