import React, { useContext, useState } from "react";
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";
import { AssertionContext } from "../contexts/AssertionContext";
import { StepsContext } from "../contexts/StepsContext";
import { Assertion } from "./Assertion";

function createUpdatedAction(field, value, context) {
  return {
    ...context,
    action: { ...context.action, [field]: value },
    modified: true,
  };
}

export function ActionDetail({
  actionContext,
  assertionCount,
  onActionContextChange,
  actionIndex,
  stepIndex,
}) {
  const { onDeleteAction } = useContext(StepsContext);
  const { action } = actionContext;
  const [selector, setSelector] = useState(action.selector || "");
  const [text, setText] = useState(action.text || "");
  const [url, setUrl] = useState(action.url || "");

  const { onShowAssertionDrawer } = useContext(AssertionContext);

  const onSelectorChange = value => {
    if (!value) return;
    setSelector(value);
    onActionContextChange(
      createUpdatedAction("selector", value, actionContext),
      actionIndex
    );
  };
  const onTextChange = value => {
    if (!value) return;
    setText(value);
    onActionContextChange(
      createUpdatedAction("text", value, actionContext),
      actionIndex
    );
  };
  const onURLChange = value => {
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
            {title != "Assert" && <strong>{title}</strong>}
          </EuiText>
        </EuiFlexItem>
        {url && (
          <EuiFlexItem>
            <EuiFieldText
              value={url}
              onChange={e => onURLChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
        {selector && !action.isAssert && (
          <EuiFlexItem>
            <EuiFieldText
              value={selector}
              onChange={e => onSelectorChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
        {text && (
          <EuiFlexItem>
            <EuiFieldText
              value={text}
              onChange={e => onTextChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        )}
        {!action.isAssert && (
          <EuiFlexItem grow={false}>
            <EuiToolTip content="Add assertion to this action">
              <EuiButtonIcon
                aria-label="Opens a dialogue to create an assertion after this action"
                color="text"
                iconType="plusInCircle"
                onClick={() =>
                  onShowAssertionDrawer({
                    previousAction: actionContext,
                    stepIndex,
                    actionIndex,
                    mode: "create",
                  })
                }
              />
            </EuiToolTip>
          </EuiFlexItem>
        )}
        {action.isAssert && (
          <EuiFlexItem>
            <Assertion
              action={action}
              actionContext={actionContext}
              actionIndex={actionIndex}
              assertionCount={assertionCount}
              onDeleteAction={onDeleteAction}
              onShowAssertionDrawer={onShowAssertionDrawer}
              stepIndex={stepIndex}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiPanel>
  );
}
