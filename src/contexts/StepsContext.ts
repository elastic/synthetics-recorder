import { createContext } from "react";
import type { ActionContext, Setter } from "../common/types";

function notImplemented() {
  throw Error("Step context not initialized");
}

interface IStepsContext {
  actions: ActionContext[][];
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  setActions: Setter<ActionContext[][]>;
}

export const StepsContext = createContext<IStepsContext>({
  actions: [],
  onDeleteAction: notImplemented,
  setActions: notImplemented,
});
