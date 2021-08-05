import React from "react";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Snippet() {
  const onTest = async () => {
    const synthResults = await ipc.callMain(
      "run-journey",
      document.getElementById("code").value
    );
    const results = document.getElementById("results");
    results.innerHTML = "";
    results.innerHTML += synthResults;
  };

  const onSave = async () => {
    const { value } = document.getElementById("code");
    await ipc.callMain("save-file", value);
  };

  return (
    <div className="snippet">
      <h4>Generated Test Snippet</h4>
      <textarea id="code"></textarea>
      <div>
        <button id="test" onClick={onTest}>
          Test
        </button>
        <button id="save" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
}
