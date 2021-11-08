const { _electron } = require("playwright");
const path = require("path");

async function startElectron() {
  try {
    const electronInstance = await _electron.launch({
      args: [path.join(__dirname, "../..", "electron", "electron.js")],
    });
    const window = await electronInstance.firstWindow();
    window.on('console', console.log);
    return electronInstance;
  } catch (e) {
    console.log(e);
  }

}

let electron;

beforeAll(async () => {
  electron = await startElectron();
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 30000));
  await electron.electronInstance.close();
})
