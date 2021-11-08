import { createContext } from "react";

function notImplemented() {
  throw Error("Recording context not initialized");
}

interface IRecordingContext {
  isPaused: boolean;
  isRecording: boolean;
  togglePause: () => void;
  toggleRecording: () => void;
}

export const RecordingContext = createContext<IRecordingContext>({
  isPaused: false,
  isRecording: false,
  togglePause: notImplemented,
  toggleRecording: notImplemented,
});
