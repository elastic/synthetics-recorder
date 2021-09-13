import { createContext } from "react";

function notImplemented() {
  throw Error("Recording context not initialized");
}

export const RecordingContext = createContext({
  isRecording: false,
  toggleRecording: notImplemented,
  isPaused: false,
  togglePause: notImplemented,
});

export function RecordingContextProvider({ children, ...props }) {
  <RecordingContext.Provider children={children} value={props} />;
}
