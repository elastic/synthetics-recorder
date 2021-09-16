import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiFieldText,
  EuiButtonIcon,
} from "@elastic/eui";

import { performSelectorLookup } from "../common/shared";

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
  const [selector, setSelector] = useState(action.selector || "");
  const [command, setCommand] = useState(action.command ?? "");
  const [assertValue, setAssertValue] = useState(action.value ?? "");

  const needsAssertingValue = () => {
    return command === commandOptions[0].value;
  };
  const onSelectorChange = (selector) => {
    setSelector(selector);
    action.selector = selector;
    onActionContextChange(actionContext, actionIndex);
  };
  const onCommandChange = (command) => {
    setCommand(command);
    action.command = command;
    onActionContextChange(actionContext, actionIndex);
  };
  const onAssertChange = (value) => {
    setAssertValue(value);
    action.value = value;
    onActionContextChange(actionContext, actionIndex);
  };

  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiFieldText
          placeholder="selector"
          value={selector}
          onChange={(e) => onSelectorChange(e.target.value)}
          prepend={
            <EuiButtonIcon
              iconType="search"
              onClick={performSelectorLookup}
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
    </EuiFlexGroup>
  );
}
