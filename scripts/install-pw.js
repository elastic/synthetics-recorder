// Load the process.env config from .env file
require("dotenv").config();

const { Registry } = require("playwright/lib/utils/registry");
const SYNTHETICS_BROWSER_REVISIONS = require("@elastic/synthetics/node_modules/playwright-chromium/browsers.json");

/**
 * Constructs the Registry with browsers that will be used
 * to download the chromium version required by the synthetics version
 */
const registry = new Registry(SYNTHETICS_BROWSER_REVISIONS);

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
