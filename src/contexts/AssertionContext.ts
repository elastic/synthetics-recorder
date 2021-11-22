import { createContext } from "react";
import { COMMAND_SELECTOR_OPTIONS } from "../common/shared";
import type { ActionContext, Setter } from "../common/types";

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

interface IAssertionContext {
  action?: ActionContext;
  actionIndex?: number;
  commandValue: string;
  isVisible: boolean;
  mode: "create" | "edit";
  onHideAssertionDrawer: () => void;
  onShowAssertionDrawer: AssertionDrawerHandler;
  selector?: string;
  setAction: Setter<ActionContext | undefined>;
  setActionIndex: Setter<number | undefined>;
  setCommandValue: Setter<string>;
  setIsVisible: Setter<boolean>;
  setMode: Setter<"create" | "edit">;
  setSelector: Setter<string | undefined>;
  setStepIndex: Setter<number | undefined>;
  setValue: Setter<string>;
  stepIndex?: number;
  value: string;
}

export const AssertionContext = createContext<IAssertionContext>({
  commandValue: COMMAND_SELECTOR_OPTIONS[0].value,
  isVisible: false,
  mode: "create",
  onHideAssertionDrawer: notInitialized,
  onShowAssertionDrawer: notInitialized,
  setAction: notInitialized,
  setActionIndex: notInitialized,
  setCommandValue: notInitialized,
  setIsVisible: notInitialized,
  setMode: notInitialized,
  setSelector: notInitialized,
  setStepIndex: notInitialized,
  setValue: notInitialized,
  value: "",
});
