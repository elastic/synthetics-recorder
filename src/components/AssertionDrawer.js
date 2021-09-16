import React, { useContext } from "react";

import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiPanel,
  EuiSelect,
  EuiTitle,
} from "@elastic/eui";

import { COMMAND_SELECTOR_OPTIONS } from "../common/commandOptions";
import { StepsContext } from "../contexts/StepsContext";
import { AssertionContext } from "../contexts/AssertionContext";

const ADD_ASSERTION_PANEL_HEIGHT = 300;

export function AssertionDrawer(props) {
  const { width, onUpdateActions } = props;
  const { actions, setActions } = useContext(StepsContext);
  const {
    actionIndex,
    action,
    value,
    isVisible,
    onHideAssertionDrawer,
    selectorValue,
    commandValue,
    setValue,
    setCommandValue,
    setSelectorValue,
    stepIndex,
  } = useContext(AssertionContext);

  function addAssertion() {
    const newActions = actions.map((step, sidx) => {
      if (stepIndex === sidx) {
        step.splice(actionIndex + 1, 0, {
          pageAlias: action.pageAlias,
          isMainFrame: action.isMainFrame,
          frameUrl: action.frameUrl,
          action: {
            name: "assert",
            isAssert: true,
            selector: selectorValue,
            command: commandValue,
            value: value,
            signals: [],
          },
        });
        return [...step];
      }
      return step;
    });

    setActions(newActions);
    onUpdateActions(newActions);
    onHideAssertionDrawer();
  }

  return (
    <EuiPanel
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
          <EuiButtonIcon iconType="cross" onClick={onHideAssertionDrawer} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup
        direction="column"
        style={{ marginTop: 4, marginBottom: 4 }}
      >
        <EuiFlexItem>
          <EuiFieldText
            prepend={<EuiButtonIcon iconType="search" />}
            onChange={(e) => setSelectorValue(e.target.value)}
            value={selectorValue}
            placeholder="Selector"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            prepend="Command"
            onChange={(e) => setCommandValue(e.target.value)}
            options={COMMAND_SELECTOR_OPTIONS}
            value={commandValue}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFieldText
            disabled={commandValue != "textContent"}
            prepend="Value"
            onChange={(e) => {
              setValue(e.target.value);
            }}
            value={value}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiButton onClick={addAssertion} size="s" style={{ float: "right" }}>
        Add
      </EuiButton>
    </EuiPanel>
  );
}
