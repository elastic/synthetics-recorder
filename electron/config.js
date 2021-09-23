const { join, dirname } = require("path");
const isDev = require("electron-is-dev");
const {
  getExecutablePath,
  getChromeVersion,
} = require("../scripts/install-pw");

/**
 * Electron resources path where all the `extraResources`
 * mentioned in build are copied to on all platforms
 */
const RESOURCES_PATH = process.resourcesPath;
const ROOT_DIR = dirname(__dirname);

/**
 * Journey directory is for storing a dummy file to simulate
 * the suite tests
 */
const JOURNEY_DIR = isDev
  ? join(ROOT_DIR, "journeys")
  : join(RESOURCES_PATH, "journeys");

/**
 * Controlls where the browser binaries are available
 * to use it for both recording and testing phase
 */
const PLAYWRIGHT_BROWSERS_PATH = isDev
  ? join(ROOT_DIR, "local-browsers")
  : join(RESOURCES_PATH, "local-browsers");

const defaultExecutablePath = getExecutablePath();
const installedVersion = getChromeVersion();

const EXECUTABLE_PATH = join(
  PLAYWRIGHT_BROWSERS_PATH,
  installedVersion,
  defaultExecutablePath.split(installedVersion)[1]
);

module.exports = {
  JOURNEY_DIR,
  PLAYWRIGHT_BROWSERS_PATH,
  EXECUTABLE_PATH,
  RESOURCES_PATH,
};
