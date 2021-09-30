import React, { useContext } from "react";

import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiPanel,
  EuiSelect,
  EuiText,
  EuiTitle,
} from "@elastic/eui";

import {
  COMMAND_SELECTOR_OPTIONS,
  performSelectorLookup,
} from "../common/shared";
import { StepsContext } from "../contexts/StepsContext";
import { AssertionContext } from "../contexts/AssertionContext";

const ADD_ASSERTION_PANEL_HEIGHT = 300;

function AssertionDrawerFormRow({ title, content }) {
  return (
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem style={{ maxWidth: 100 }}>{title}</EuiFlexItem>
      <EuiFlexItem>{content}</EuiFlexItem>
    </EuiFlexGroup>
  );
}

function getInsertionIndex(step, actionIndex) {
  let i = actionIndex + 1;
  for (; i < step.length; i++) {
    if (step[i].action.isAssert !== true) {
      break;
    }
  }
  return i;
}

export function AssertionDrawer({ width }) {
  const { actions, setActions } = useContext(StepsContext);
  const {
    actionIndex,
    action,
    value,
    isVisible,
    onHideAssertionDrawer,
    selector,
    commandValue,
    setValue,
    setCommandValue,
    setSelector,
    stepIndex,
    mode,
  } = useContext(AssertionContext);

  function addAssertion() {
    const newActions = actions.map((step, sidx) => {
      if (stepIndex === sidx) {
        const newAction = {
          pageAlias: action.pageAlias,
          isMainFrame: action.isMainFrame,
          frameUrl: action.frameUrl,
          action: {
            name: "assert",
            isAssert: true,
            selector: selector,
            command: commandValue,
            value: commandValue == "textContent" ? value : null,
            signals: [],
          },
        };
        if (mode == "create") {
          step.splice(getInsertionIndex(step, actionIndex), 0, newAction);
        } else if (mode == "edit") {
          step.splice(actionIndex, 1, newAction);
        }

        return [...step];
      }
      return step;
    });

    setActions(newActions);
    onHideAssertionDrawer();
  }

  return (
    <EuiPanel
      hasBorder
      borderRadius="none"
      style={{
        animationTimingFunction: "ease-in",
        position: "fixed",
        bottom: 0,
        transform: `translateY(${
          isVisible ? 0 : `${ADD_ASSERTION_PANEL_HEIGHT}px`
        }`,
        transition: "transform 450ms",
        minWidth: width,
      }}
    >
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3>Add assertion</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            aria-label="Close the create assertion dialogue"
            iconType="cross"
            onClick={onHideAssertionDrawer}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup
        direction="column"
        style={{ marginTop: 4, marginBottom: 4 }}
      >
        <EuiFlexItem>
          <AssertionDrawerFormRow
            title={<EuiText textAlign="right">Selector</EuiText>}
            content={
              <EuiFieldText
                prepend={
                  <EuiButtonIcon
                    aria-label="Choose the type of assertion command"
                    iconType="search"
                    onClick={performSelectorLookup(setSelector)}
                  />
                }
                onChange={e => setSelector(e.target.value)}
                value={selector}
                placeholder="Selector"
              />
            }
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <AssertionDrawerFormRow
            title={<EuiText textAlign="right">Command</EuiText>}
            content={
              <EuiSelect
                onChange={e => {
                  setCommandValue(e.target.value);
                }}
                options={COMMAND_SELECTOR_OPTIONS}
                value={commandValue}
              />
            }
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <AssertionDrawerFormRow
            title={<EuiText textAlign="right">Value</EuiText>}
            content={
              <EuiFieldText
                disabled={commandValue != "textContent"}
                onChange={e => {
                  setValue(e.target.value);
                }}
                value={value}
              />
            }
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={!selector}
            aria-label="Create the assertion you have defined"
            onClick={addAssertion}
            size="s"
          >
            Add
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
