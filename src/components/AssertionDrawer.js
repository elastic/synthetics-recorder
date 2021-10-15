import React, { useContext } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiSelect,
  EuiText,
  EuiTitle,
} from "@elastic/eui";

import {
  COMMAND_SELECTOR_OPTIONS,
  createExternalLinkHandler,
  performSelectorLookup,
} from "../common/shared";
import { StepsContext } from "../contexts/StepsContext";
import { AssertionContext } from "../contexts/AssertionContext";

const PLAYWRIGHT_ASSERTIONS_DOCS_LINK =
  "https://playwright.dev/docs/assertions/";

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

  if (!isVisible) return null;

  return (
    <EuiFlyout
      aria-labelledby="assertionDrawerHeader"
      closeButtonAriaLabel="Close the create assertion dialogue."
      ownFocus
      onClose={onHideAssertionDrawer}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="assertionDrawerHeader">Add assertion</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody
        aria-label="This element contains the controls you can use to create an assertion."
        banner={
          <EuiCallOut heading="h3" iconType="iInCircle" size="s">
            <EuiFlexGroup
              alignItems="baseline"
              direction="column"
              gutterSize="xs"
            >
              <EuiFlexItem grow={false}>
                Add an assertion to check additional types of functionality in
                your monitoring script.
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  flush="left"
                  iconSide="right"
                  iconType="popout"
                  onClick={createExternalLinkHandler(
                    PLAYWRIGHT_ASSERTIONS_DOCS_LINK
                  )}
                  size="xs"
                >
                  Read more about assertions
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiCallOut>
        }
      >
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
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
