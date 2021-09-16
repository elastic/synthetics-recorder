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
