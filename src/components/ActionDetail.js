import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFieldText,
  EuiPanel,
} from "@elastic/eui";
import { Assertion } from "./Assertion";

function createUpdatedAction(field, value, context) {
  return {
    ...context,
    action: { ...context.action, [field]: value },
  };
}

export function ActionDetail({
  actionContext,
  onActionContextChange,
  actionIndex,
}) {
  const { action } = actionContext;
  const [selector, setSelector] = useState(action.selector || "");
  const [text, setText] = useState(action.text || "");
  const [url, setUrl] = useState(action.url || "");

  const onSelectorChange = (value) => {
    if (!value) return;
    setSelector(value);
    onActionContextChange(
      createUpdatedAction("selector", value, actionContext),
      actionIndex
    );
  };
  const onTextChange = (value) => {
    if (!value) return;
    setText(value);
    onActionContextChange(
      createUpdatedAction("text", value, actionContext),
      actionIndex
    );
  };
  const onURLChange = (value) => {
    if (!value) return;
    setUrl(value);
    onActionContextChange(
      createUpdatedAction("url", value, actionContext),
      actionIndex
    );
  };
  const title = action.name[0].toUpperCase() + action.name.slice(1);

  if (action.text !== text) {
    setText(action.text);
  }

  return (
    <EuiPanel color="transparent" paddingSize="s">
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem grow={false} style={{ width: 50 }}>
          <EuiText size="s">
            <strong>{title}</strong>
          </EuiText>
        </EuiFlexItem>
        {url && (
          <EuiFlexItem>
            <EuiFieldText
              value={url}
              onChange={(e) => onURLChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
        {selector && !action.isAssert && (
          <EuiFlexItem>
            <EuiFieldText
              value={selector}
              onChange={(e) => onSelectorChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
        {text && (
          <EuiFlexItem>
            <EuiFieldText
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {action.isAssert && (
        <Assertion
          key={title + Date.now.toString()}
          actionContext={actionContext}
          actionIndex={actionIndex}
          onActionContextChange={onActionContextChange}
        />
      )}
    </EuiPanel>
  );
}
