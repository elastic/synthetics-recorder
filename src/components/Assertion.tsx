import React from "react";
import {
  EuiBadge,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
  useEuiTheme,
} from "@elastic/eui";
import { COMMAND_SELECTOR_OPTIONS } from "../common/shared";
import type { Action, ActionContext } from "../common/types";
import { AssertionDrawerHandler } from "../contexts/AssertionContext";

interface IAssertion {
  action: Action;
  actionContext: ActionContext;
  actionIndex: number;
  assertionCount: number;
  onDeleteAction: (stepIndex: number, actionIndex: number) => void;
  onShowAssertionDrawer: AssertionDrawerHandler;
  stepIndex: number;
}

export function Assertion({
  action,
  actionContext,
  actionIndex,
  assertionCount,
  onDeleteAction,
  onShowAssertionDrawer,
  stepIndex,
}: IAssertion) {
  const {
    euiTheme: {
      border: {
        thin,
        radius: { medium },
      },
    },
  } = useEuiTheme();

  const commandOption = COMMAND_SELECTOR_OPTIONS.find(
    ({ value: v }) => v === action.command
  );
  const commandText = commandOption ? commandOption.text : action.command;

  return (
    <EuiFlexGroup
      alignItems="center"
      style={{
        border: thin,
        borderRadius: medium,
        marginTop: 0,
        marginLeft: 0,
        marginBottom: 0,
        marginRight: 36,
        maxHeight: 40,
        minWidth: 310,
      }}
    >
      <EuiFlexItem>
        <EuiFlexGroup alignItems="center" gutterSize="none">
          <EuiFlexItem>Assertion {assertionCount}&nbsp;</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip
              content={`${action.selector}${
                action.value ? `: "${action.value}"` : ""
              }`}
            >
              <EuiBadge>{commandText}</EuiBadge>
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          aria-label="Open a dialogue to edit this assertion."
          color="text"
          iconType="pencil"
          onClick={() => {
            onShowAssertionDrawer({
              previousAction: actionContext,
              actionIndex,
              stepIndex,
              mode: "edit",
            });
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          aria-label="Delete this assertion."
          color="text"
          iconType="trash"
          onClick={() => onDeleteAction(stepIndex, actionIndex)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
