import { createContext } from "react";

function notImplemented() {
  throw Error("Step context not initialized");
}

export const StepsContext = createContext({
  actions: [],
  onDeleteAction: notImplemented,
  setActions: notImplemented,
});
