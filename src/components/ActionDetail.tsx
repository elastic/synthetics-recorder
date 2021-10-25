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
import type { ActionContext } from "../common/types";

function createUpdatedAction(
  field: string,
  value: string,
  context: ActionContext
) {
  return {
    ...context,
    action: { ...context.action, [field]: value },
    modified: true,
  };
}

interface IActionDetail {
  actionContext: ActionContext;
  actionIndex: number;
  assertionCount: number;
  onActionContextChange: (
    actionContext: ActionContext,
    actionIndex: number
  ) => void;
  stepIndex: number;
}

export function ActionDetail({
  actionContext,
  actionIndex,
  assertionCount,
  onActionContextChange,
  stepIndex,
}: IActionDetail) {
  const { onDeleteAction } = useContext(StepsContext);
  const { action } = actionContext;
  const [selector, setSelector] = useState(action.selector || "");
  const [text, setText] = useState(action.text || "");
  const [url, setUrl] = useState(action.url || "");

  const { onShowAssertionDrawer } = useContext(AssertionContext);

  const onSelectorChange = (value: string) => {
    if (!value) return;
    setSelector(value);
    onActionContextChange(
      createUpdatedAction("selector", value, actionContext),
      actionIndex
    );
  };
  const onTextChange = (value: string) => {
    if (!value) return;
    setText(value);
    onActionContextChange(
      createUpdatedAction("text", value, actionContext),
      actionIndex
    );
  };
  const onURLChange = (value: string) => {
    if (!value) return;
    setUrl(value);
    onActionContextChange(
      createUpdatedAction("url", value, actionContext),
      actionIndex
    );
  };
  const title = action.name[0].toUpperCase() + action.name.slice(1);

  if (action.text !== text && typeof action.text !== "undefined") {
    setText(action.text);
  }

  return (
    <EuiPanel style={{ margin: "16px 0px" }} hasShadow={false} paddingSize="s">
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem grow={false} style={{ width: 50 }}>
          {title !== "Assert" && <EuiText size="s">{title}</EuiText>}
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
            <EuiToolTip content="Add an assertion">
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
