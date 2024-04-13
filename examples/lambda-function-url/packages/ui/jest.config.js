module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/node_modules/',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass|less)$': 'identity-obj-proxy',
  },
}
