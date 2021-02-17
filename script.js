const { ipcRenderer } = require("electron");

const button = document.getElementById("journey");
const results = document.getElementById("results");

button.addEventListener("click", () => {
  ipcRenderer.on("done", (event, data) => {
    results.innerHTML = JSON.stringify(data);
  });
  ipcRenderer.send("start", true);
});
