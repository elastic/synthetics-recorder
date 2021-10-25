import React, { createContext } from "react";
import type { ActionContext } from "../common/types";

function notImplemented() {
  throw Error("Step context not initialized");
}

interface IStepsContext {
  actions: ActionContext[][];
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  setActions: React.Dispatch<React.SetStateAction<ActionContext[][]>>;
}

export const StepsContext = createContext<IStepsContext>({
  actions: [],
  onDeleteAction: notImplemented,
  setActions: notImplemented,
});
