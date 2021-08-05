import React, { useState } from "react";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function HeaderComponent() {
  const [url, setUrl] = useState("");

  async function onTest() {
    const synthResults = await ipc.callMain(
      "run-journey",
      document.getElementById("code").value
    );
    const results = document.getElementById("results");
    results.innerHTML = "";
    results.innerHTML += synthResults;
  }

  async function onRecord() {
    const scriptArea = document.getElementById("code");
    const urlNode = document.querySelector(".url");
    const synthJourneys = await ipc.callMain("record-journey", {
      url: urlNode.value,
    });
    scriptArea.value = synthJourneys;
  }

  function onStop() {
    ipc.send("stop");
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
        value={url}
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
