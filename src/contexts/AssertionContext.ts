import React, { createContext } from "react";
import type { ActionContext } from "../common/types";

function notInitialized() {
  throw Error("Assertion context not initialized");
}

interface ShowAssertionDrawerHandlerParams {
  actionIndex: number;
  mode: "create" | "edit";
  previousAction: ActionContext;
  stepIndex: number;
}

export type AssertionDrawerHandler = (
  params: ShowAssertionDrawerHandlerParams
) => void;

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

interface IAssertionContext {
  action: ActionContext | null;
  actionIndex: number | null;
  commandValue: string;
  isVisible: boolean;
  mode: "create" | "edit";
  onHideAssertionDrawer: () => void;
  onShowAssertionDrawer: AssertionDrawerHandler;
  selector: string;
  setAction: Setter<ActionContext | null>;
  setActionIndex: Setter<number | null>;
  setCommandValue: Setter<string>;
  setIsVisible: Setter<boolean>;
  setMode: Setter<"create" | "edit">;
  setSelector: Setter<string>;
  setStepIndex: Setter<number | null>;
  setValue: Setter<string>;
  stepIndex: number | null;
  value: string;
}

export const AssertionContext = createContext<IAssertionContext>({
  action: null,
  actionIndex: null,
  commandValue: "",
  isVisible: false,
  mode: "create",
  onHideAssertionDrawer: notInitialized,
  onShowAssertionDrawer: notInitialized,
  selector: "",
  setAction: notInitialized,
  setActionIndex: notInitialized,
  setCommandValue: notInitialized,
  setIsVisible: notInitialized,
  setMode: notInitialized,
  setSelector: notInitialized,
  setStepIndex: notInitialized,
  setValue: notInitialized,
  stepIndex: null,
  value: "",
});
