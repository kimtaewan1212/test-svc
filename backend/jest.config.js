/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/helpers/globalSetup.js',
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  maxWorkers: 1,
};
