import { createContext } from "react";

function notInitialized() {
  throw Error("Assertion context not initialized");
}

export const AssertionContext = createContext({
  isAssertionDrawerVisible: false,
  onShowAssertionDrawer: notInitialized,
  onHideAssertionDrawer: notInitialized,
});
