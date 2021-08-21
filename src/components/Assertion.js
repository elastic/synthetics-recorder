import React, { useState } from "react";
import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiSelect,
  EuiFieldText,
  EuiSpacer,
  EuiButtonIcon,
} from "@elastic/eui";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function Assertion({
  actionContext,
  onActionContextChange,
  actionIndex,
}) {
  const commandOptions = [
    {
      value: "textContent",
      text: "Text content",
    },
    {
      value: "isVisible",
      text: "Check Visibility",
    },
    {
      value: "isHidden",
      text: "Check Hidden",
    },
  ];
  const { action } = actionContext;
  const [selector, setSelector] = useState("");
  const [command, setCommand] = useState("");
  const [assertValue, setAssertValue] = useState("");

  const onSelectorLookup = async () => {
    await ipc.callMain("set-mode", "inspecting");
    ipc.answerMain("received-selector", async (selector) => {
      setSelector(() => selector);
      onSelectorChange(selector);
      await ipc.callMain("set-mode", "recording");
    });
  };
  const needsAssertingValue = () => {
    return command === commandOptions[0].value;
  };
  const onSelectorChange = (selector) => {
    setSelector(selector);
    action.signals[0].selector = selector;
    onActionContextChange(actionContext, actionIndex);
  };
  const onCommandChange = (command) => {
    setCommand(command);
    action.signals[0].name = command;
    onActionContextChange(actionContext, actionIndex);
  };
  const onAssertChange = (value) => {
    setAssertValue(value);
    action.signals[0].value = value;
    onActionContextChange(actionContext, actionIndex);
  };

  return (
    <>
      <EuiFlexGrid columns={3}>
        <EuiFlexItem>
          <EuiFieldText
            placeholder="selector"
            value={selector}
            onChange={(e) => onSelectorChange(e.target.value)}
            prepend={
              <EuiButtonIcon
                iconType="search"
                onClick={onSelectorLookup}
                aria-label="search"
              />
            }
          ></EuiFieldText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            options={commandOptions}
            hasNoInitialSelection
            value={command}
            onChange={(e) => onCommandChange(e.target.value)}
          />
        </EuiFlexItem>
        {needsAssertingValue() && (
          <EuiFlexItem>
            <EuiFieldText
              placeholder="value"
              value={assertValue}
              onChange={(e) => onAssertChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
      </EuiFlexGrid>
      <EuiSpacer />
    </>
  );
}
