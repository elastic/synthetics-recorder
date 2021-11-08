module.exports = async () => {
  const packagerExited = new Promise(resolve => {
    global.__packager__.on('close', (signal) => {
      console.error(`exited ${signal}`);
      resolve();
    });
  });

  // We must close all of the child process' file descriptors
  // in order for it to exit. Otherwise, Jest _will_ hang.
  global.__packager__.stdout.unref();
  global.__packager__.stderr.unref();
  global.__packager__.kill();
  await packagerExited;
}
