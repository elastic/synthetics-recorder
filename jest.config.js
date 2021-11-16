module.exports = {
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [`node_modules`, `\\.cache`],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "babel-jest",
  },
};
