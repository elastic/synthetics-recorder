const { ipcRenderer } = require("electron");

const start = document.getElementById("start");
const record = document.getElementById("record");
const stop = document.getElementById("stop");
const scriptArea = document.getElementById("code");
const results = document.getElementById("results");
const records = document.getElementById("records");

start.addEventListener("click", () => {
  ipcRenderer.on("done", (event, data) => {
    results.value += data.replace(/\n/g, "") + "\n";
  });
  ipcRenderer.send("start", scriptArea.value);
});

record.addEventListener("click", () => {
  const tBody = document.createElement("tbody");
  records.appendChild(tBody);
  ipcRenderer.on("action", (event, action) => {
    /**
     * Render in table
     */
    const { name, url, selector, text } = action.action;
    const tRow = tBody.insertRow();
    tRow.insertCell().appendChild(document.createTextNode(name));
    if (url || selector) {
      tRow.insertCell().appendChild(document.createTextNode(url || selector));
    }
    if (text) {
      tRow.insertCell().appendChild(document.createTextNode(text));
    }
  });

  ipcRenderer.on("code", (event, code) => {
    scriptArea.value += code;
  });

  const urlNode = document.querySelector(".url");
  ipcRenderer.send("record", { url: urlNode.value });
});

stop.addEventListener("click", () => ipcRenderer.send("stop"));
