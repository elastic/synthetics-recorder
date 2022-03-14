const { spawn } = require("child_process");
const { downloadForPlatform } = require("./download-browsers");

exports.default = function beforePack(ctx) {
  const arch = Arch[ctx.arch];
  const platform = ctx.electronPlatformName;
  return Promise.all([downloadForPlatform(platform), fixSharp(arch, platform)]);
};

const { Arch } = require("electron-builder");

function fixSharp(arch, platform) {
  // electron-builder gets the arch and platform information with its own option parameter and logic.
  // native dependency sharp needs to get arch and platform information via `npm_config_arch` and `npm_config_platform` when installing
  // as this function is called by electron-builder and they should run in the same context and run it for the same target platform and arch,
  // we set the process.env.npm_config_* manually
  // as in when installing the sharp, it uses what electron-builder is targeting
  // so that we align the target arch and platform for both electron-builder and sharp
  process.env.npm_config_arch = arch;
  process.env.npm_config_platform = platform;
  return new Promise((resolve, reject) => {
    const npmInstall = spawn("npm", ["run", "fix-sharp"], {
      stdio: "inherit",
      shell: true,
    });
    npmInstall.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("process finished with error code " + code));
      }
    });
    npmInstall.on("error", error => {
      reject(error);
    });
  });
}
