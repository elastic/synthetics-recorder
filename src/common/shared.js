const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export const COMMAND_SELECTOR_OPTIONS = [
  {
    value: "textContent",
    text: "Text content",
  },
  {
    value: "isVisible",
    text: "Check Visibility",
  },
  {
    value: "isHidden",
    text: "Check Hidden",
  },
];

export async function performSelectorLookup() {
  const selector = await ipc.callMain("set-mode", "inspecting");
  if (selector) {
    onSelectorChange(selector);
    await ipc.callMain("set-mode", "recording");
  }
}
