import { useCallback, useState } from "react";
import { COMMAND_SELECTOR_OPTIONS } from "../common/shared";

export function useAssertionDrawer() {
  const [commandValue, setCommandValue] = useState(
    COMMAND_SELECTOR_OPTIONS[0].value
  );
  const [isVisible, setIsVisible] = useState(false);
  const [selector, setSelector] = useState(null);
  const [stepIndex, setStepIndex] = useState(null);
  const [actionIndex, setActionIndex] = useState(null);
  const [value, setValue] = useState("");
  const [action, setAction] = useState(null);

  const onShowAssertionDrawer = useCallback(
    function ({ previousAction, actionIndex: aidx, stepIndex: sidx }) {
      setSelector(previousAction.action.selector);
      setStepIndex(sidx);
      setActionIndex(aidx);
      setAction(previousAction);
      setIsVisible(true);
    },
    [setStepIndex, setActionIndex, setAction, setIsVisible, setSelector]
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
    onHideAssertionDrawer,
    onShowAssertionDrawer,
    selector,
    setAction,
    setActionIndex,
    setStepIndex,
    setValue,
    setCommandValue,
    setIsVisible,
    setSelector,
    stepIndex,
    value,
  };
}
