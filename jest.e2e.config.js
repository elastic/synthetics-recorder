/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  preset: 'ts-jest',
  bail: true,

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  globalSetup: "<rootDir>/e2e/setup/packager.js",
  globalTeardown: "<rootDir>/e2e/teardown/packager.js",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [ "<rootDir>/e2e/setup/electron.js" ],

  testEnvironment: "node",

  testPathIgnorePatterns: [
    `node_modules`,
    `\\.cache`,
    "./e2e/setup"
  ],

  // This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
  // testURL: "http://localhost",
};
