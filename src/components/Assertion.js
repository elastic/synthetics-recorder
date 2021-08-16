import React, { useState } from "react";
import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiSelect,
  EuiFieldText,
  EuiSpacer,
} from "@elastic/eui";

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
  const [command, setCommand] = useState(commandOptions[0].value);
  const [assertValue, setAssertValue] = useState("");

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
          ></EuiFieldText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            options={commandOptions}
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
