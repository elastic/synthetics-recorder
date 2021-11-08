const { spawn } = require('child_process');

const TEST_PORT = process.env.TEST_PORT || 61337;

const packageFiles = async () => {
  return new Promise((resolve, reject) => {
    const ls = spawn('npm', ["run", "react:start"], {
      env: {
        PORT: TEST_PORT,
        PATH: process.env.PATH,
        BROWSER: "none",
      },
      shell: true,
      detached: true
    });


    ls.stdout.on('data', async (data) => {
      if (data.indexOf("Something is already running on port") !== -1) {
        const killProcess = spawn(`lsof -i 'tcp':${TEST_PORT} | grep 'LISTEN' | awk '{print $2}' | xargs kill -9`, {
          shell: true,
          detached: true
        });

        await new Promise(resolve => killProcess.on("close", resolve));
        resolve(packageFiles());
      }

      if (data.indexOf("You can now view") !== -1) {
        resolve(ls);
      }
    });

    ls.stderr.on('data', (data) => {
      console.error(data);
      reject();
    });
  });
};

module.exports = async () => {
  const packager = await packageFiles();
  global.__packager__ = packager;
}

