/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }],
  },
  testMatch: [
    '**/__tests__/**/*.test.ts?(x)', 
    '**/__tests__/**/!(setupTests).ts?(x)', 
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    // Mock node modules that don't work in the test environment
    "^electron$": "<rootDir>/src/__mocks__/electronMock.ts",
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/dist/',
    'setupTests.ts'
  ],
  // Fix for window is not defined errors
  setupFiles: ['<rootDir>/src/__tests__/setupTests.ts'],
}; 