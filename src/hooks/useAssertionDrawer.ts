import { useCallback, useState } from "react";
import { COMMAND_SELECTOR_OPTIONS } from "../common/shared";
import type { ActionContext, AssertionDrawerMode } from "../common/types";

export function useAssertionDrawer() {
  const [commandValue, setCommandValue] = useState(
    COMMAND_SELECTOR_OPTIONS[0].value
  );
  const [action, setAction] = useState<ActionContext | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selector, setSelector] = useState("");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<AssertionDrawerMode>("create");
  const [value, setValue] = useState("");

  const onShowAssertionDrawer = useCallback(
    function ({ previousAction, actionIndex: aidx, stepIndex: sidx, mode: m }) {
      setSelector(previousAction.action.selector);
      if (previousAction.action.command) {
        setCommandValue(previousAction.action.command);
      }
      setValue(previousAction.action.value ?? "");
      setStepIndex(sidx);
      setActionIndex(aidx);
      setAction(previousAction);
      setIsVisible(true);
      setMode(m);
    },
    [
      setStepIndex,
      setActionIndex,
      setAction,
      setIsVisible,
      setSelector,
      setMode,
    ]
  );

  const onHideAssertionDrawer = useCallback(
    function () {
      setIsVisible(false);
    },
    [setIsVisible]
  );

  return {
    action,
    actionIndex,
    commandValue,
    isVisible,
    mode,
    onHideAssertionDrawer,
    onShowAssertionDrawer,
    selector,
    setAction,
    setActionIndex,
    setMode,
    setStepIndex,
    setValue,
    setCommandValue,
    setIsVisible,
    setSelector,
    stepIndex,
    value,
  };
}
