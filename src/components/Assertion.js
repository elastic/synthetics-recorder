import React from "react";
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
} from "@elastic/eui";

export function Assertion({
  action,
  actionContext,
  actionIndex,
  assertionCount,
  onDeleteAction,
  onShowAssertionDrawer,
  stepIndex,
}) {
  const {
    euiTheme: {
      border: {
        thin,
        radius: { medium },
      },
    },
  } = useEuiTheme();

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
      }}
    >
      <EuiFlexItem>
        Assertion {assertionCount}&nbsp;
        {action.selector} {action.command}
        {action.value ? `, ${action.value}` : ""}
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
