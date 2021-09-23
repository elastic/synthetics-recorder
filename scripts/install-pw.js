// Load the process.env config from .env file
require("dotenv").config();

const { Registry } = require("playwright/lib/utils/registry");
const SYNTHETICS_BROWSER_REVISIONS = require("@elastic/synthetics/node_modules/playwright-chromium/browsers.json");
/**
 * Constructs the Browser JSON that will be used by the
 * registry to download the chromium version specific to
 * the synthetics version
 */
function constructBrowserVersions() {
  const { browsers } = SYNTHETICS_BROWSER_REVISIONS;
  return browsers.map(browser => {
    const allowedInstalls = ["chromium", "ffmpeg"];
    if (!allowedInstalls.includes(browser.name)) {
      browser.installByDefault = false;
    }
    return browser;
  });
}

const browserJSON = {
  browsers: constructBrowserVersions(),
};
const registry = new Registry(browserJSON);

module.exports.getChromeVersion = function () {
  const { browsers } = SYNTHETICS_BROWSER_REVISIONS;
  const revision = browsers.find(
    browser => browser.name == "chromium"
  ).revision;
  return `chromium-${revision}`;
};

module.exports.getExecutablePath = function (browserName = "chromium") {
  return registry.findExecutable(browserName).executablePath();
};

(async () => {
  if (require.main === module) {
    try {
      await registry.install();
      console.log("Installation complete");
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
})();
