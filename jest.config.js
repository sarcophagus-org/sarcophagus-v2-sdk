module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.test.ts', '**/test/**/*.integration.ts'],
  // https://chat.openai.com/share/f612708b-692b-487f-861b-7081f8bec5c5
  moduleNameMapper: {
    libp2p: '<rootDir>/test/__mocks__/libp2pMock.ts',
  },
};
