import React, { useState } from "react";
const { ipcRenderer } = window.require("electron");

export function HeaderComponent() {
  const [url, setUrl] = useState("");
  const scriptArea = document.getElementById("code");
  const results = document.getElementById("results");
  const records = document.getElementById("records");

  function onTest() {
    ipcRenderer.on("done", (event, data) => {
      results.innerHTML += data.replace(/\n/g, "") + "\n";
    });
    ipcRenderer.send("start", scriptArea.value);
  }

  function onRecord() {
    const tBody = document.createElement("tbody");
    records.appendChild(tBody);
    ipcRenderer.on("action", (event, action) => {
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
  }

  function onStop() {
    ipcRenderer.send("stop");
  }

  function handleChange(e) {
    setUrl(e.target.value);
  }

  return (
    <header>
      <div>
        <h3>Elastic Synthetics Recorder</h3>
      </div>
      <input
        className="url"
        type="text"
        placeholder="Enter URL to test"
        onChange={handleChange}
      />
      <button id="test" onClick={onTest}>
        Test
      </button>
      <button id="record" onClick={onRecord}>
        Record
      </button>
      <button id="stop" onClick={onStop}>
        Stop
      </button>
    </header>
  );
}
