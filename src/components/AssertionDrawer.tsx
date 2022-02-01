/*
MIT License

Copyright (c) 2021-present, Elastic NV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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
  updateAction,
} from "../common/shared";
import { StepsContext } from "../contexts/StepsContext";
import { AssertionContext } from "../contexts/AssertionContext";
import type { ActionContext } from "../common/types";
import { CommunicationContext } from "../contexts/CommunicationContext";

const PLAYWRIGHT_ASSERTIONS_DOCS_LINK =
  "https://playwright.dev/docs/assertions/";

function AssertionDrawerFormRow({
  title,
  content,
}: {
  title: JSX.Element;
  content: JSX.Element;
}) {
  return (
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem style={{ maxWidth: 100 }}>{title}</EuiFlexItem>
      <EuiFlexItem>{content}</EuiFlexItem>
    </EuiFlexGroup>
  );
}

function getInsertionIndex(step: ActionContext[], actionIndex: number) {
  let i = actionIndex + 1;
  for (; i < step.length; i++) {
    if (step[i].action.isAssert !== true) {
      break;
    }
  }
  return i;
}

const textFieldAssertionValues = ["innerText", "textContent"];

export function AssertionDrawer() {
  const { actions, setActions } = useContext(StepsContext);
  const { ipc } = useContext(CommunicationContext);
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
      if (stepIndex === sidx && action) {
        const newAction: ActionContext = {
          action: {
            name: "assert",
            isAssert: true,
            selector: selector || "",
            command: commandValue,
            value: commandValue === "textContent" ? value ?? null : null,
            signals: [],
          },
          frameUrl: action.frameUrl,
          modified: false,
          isMainFrame: action.isMainFrame,
          pageAlias: action.pageAlias,
        };
        if (mode === "create") {
          step.splice(getInsertionIndex(step, actionIndex!), 0, newAction);
        } else if (mode === "edit") {
          step.splice(actionIndex!, 1, newAction);
        }

        return [...step];
      }
      return step;
    });

    setActions(newActions);
  }

  function updateAssertion() {
    if (typeof stepIndex === "undefined" || typeof actionIndex === "undefined")
      return;
    setActions(oldActions =>
      updateAction(oldActions, value || "", stepIndex, actionIndex)
    );
  }

  function getCloseHandler() {
    let func: () => void | undefined;
    if (mode === "create") {
      func = addAssertion;
    } else if (mode === "edit") {
      func = updateAssertion;
    }
    return () => {
      if (func) {
        func();
      }
      onHideAssertionDrawer();
    };
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
          <h2 id="assertionDrawerHeader">
            {mode === "create" ? "Add assertion" : "Edit assertion"}
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody
        aria-label="This element contains the controls you can use to create an assertion."
        banner={
          mode === "create" && (
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
                      ipc,
                      PLAYWRIGHT_ASSERTIONS_DOCS_LINK
                    )}
                    size="xs"
                  >
                    Read more about assertions
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiCallOut>
          )
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
                      onClick={performSelectorLookup(ipc, setSelector)}
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
                  disabled={
                    textFieldAssertionValues.indexOf(commandValue) === -1
                  }
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
              onClick={getCloseHandler()}
              size="s"
            >
              {mode === "create" ? "Add" : "Update"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
