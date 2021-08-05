import React, { useState } from "react";
const { ipcRenderer } = window.require("electron");

export function HeaderComponent() {
  const [url, setUrl] = useState("");

  function onTest() {
    const results = document.getElementById("results");
    ipcRenderer.on("done", (event, data) => {
      console.log("data", data);
      results.innerHTML = "";
      results.innerHTML += data;
    });
    ipcRenderer.send("start", document.getElementById("code").value);
  }

  function onRecord() {
    const records = document.getElementById("records");
    const tBody = document.createElement("tbody");
    const scriptArea = document.getElementById("code");
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
      scriptArea.value = code;
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
        value="https://vigneshh.in"
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
