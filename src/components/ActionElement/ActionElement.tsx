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

import {
  useEuiTheme,
  EuiFlexGroup,
  EuiFlexItem,
  EuiAccordion,
} from "@elastic/eui";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { SMALL_SCREEN_BREAKPOINT } from "../../common/shared";
import { ActionContext } from "../../common/types";
import { StepsContext } from "../../contexts/StepsContext";
import { ActionDetail } from "../ActionDetail";
import { HeadingText } from "./HeadingText";
import { ActionStatusIndicator } from "../ActionStatusIndicator";
import { Assertion } from "../Assertion";
import { ActionControlButton } from "./ControlButton";
import { ActionSettingsPopover } from "./SettingsPopover";

interface IActionElement {
  actionIndex: number;
  className?: string;
  initialIsOpen?: boolean;
  step: ActionContext;
  stepIndex: number;
}

const ActionAccordion = styled(EuiAccordion)`
  padding: 8px 0px;
`;

const Container = styled(EuiFlexGroup)`
  display: flex;
  min-height: 50px;
  min-width: 800px;
  margin-left: -39px;
`;

function ActionComponent({
  actionIndex,
  className,
  initialIsOpen,
  step,
  stepIndex,
}: IActionElement) {
  const { onDeleteAction, onInsertAction } = useContext(StepsContext);
  const { euiTheme } = useEuiTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const settingsHandler = (handler: () => void) => {
    return function () {
      if (isSettingsPopoverOpen) {
        setIsSettingsPopoverOpen(false);
      }
      handler();
    };
  };
  const onEdit = settingsHandler(() => {
    setIsOpen(!isOpen);
  });
  const close = () => setIsOpen(false);
  return (
    <Container className={className} gutterSize="none">
      <EuiFlexItem grow={false}>
        {!step.action.isAssert && <ActionStatusIndicator />}
      </EuiFlexItem>
      <EuiFlexItem
        style={{
          borderLeft: euiTheme.border.thick,
          paddingLeft: step.action.isAssert ? 20 : 20,
          marginLeft: step.action.isAssert ? 50 : 0,
        }}
      >
        <ActionAccordion
          buttonProps={{ style: { display: "none" } }}
          paddingSize="m"
          id={`step-accordion-${step.title}`}
          initialIsOpen={initialIsOpen}
          forceState={isOpen ? "open" : "closed"}
          onMouseOver={() => {
            if (!areControlsVisible) {
              setAreControlsVisible(true);
            }
          }}
          onMouseLeave={() => {
            setAreControlsVisible(false);
          }}
          extraAction={
            <EuiFlexGroup
              alignItems="center"
              gutterSize="xs"
              justifyContent="spaceBetween"
            >
              <EuiFlexItem>
                <HeadingText actionContext={step} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <ActionControlButton
                  iconType="pencil"
                  isVisible={areControlsVisible}
                  onClick={onEdit}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <ActionSettingsPopover
                  isVisible={areControlsVisible || isSettingsPopoverOpen}
                  onAddAssertion={settingsHandler(() => {
                    onInsertAction(
                      {
                        ...step,
                        action: {
                          ...step.action,
                          name: "assert",
                          selector: step.action.selector || "",
                          command: "isVisible",
                          value: step.action.value || null,
                          signals: [],
                          isAssert: true,
                        },
                        modified: false,
                      },
                      stepIndex,
                      actionIndex + 1
                    );
                  })}
                  onEdit={onEdit}
                  onDelete={settingsHandler(() => {
                    onDeleteAction(stepIndex, actionIndex);
                  })}
                  isOpen={isSettingsPopoverOpen}
                  setIsOpen={setIsSettingsPopoverOpen}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          }
        >
          {!step.action.isAssert && (
            <ActionDetail
              actionContext={step}
              actionIndex={actionIndex}
              close={close}
              stepIndex={stepIndex}
            />
          )}
          {step.action.isAssert && (
            <Assertion
              action={step.action}
              actionContext={step}
              actionIndex={actionIndex}
              close={close}
              onDeleteAction={onDeleteAction}
              stepIndex={stepIndex}
            />
          )}
        </ActionAccordion>
      </EuiFlexItem>
    </Container>
  );
}

export const ActionElement = styled(ActionComponent)`
  .euiAccordion__triggerWrapper {
    background-color: ${props => props.theme.colors.lightestShade};
    border-top-left-radius: ${props => props.theme.border.radius.medium};
    border-top-right-radius: ${props => props.theme.border.radius.medium};
    border: ${props => props.theme.border.thin};
    padding: 12px;
  }

  .euiAccordion__childWrapper {
    border-right: ${props => props.theme.border.thin};
    border-bottom: ${props => props.theme.border.thin};
    border-left: ${props => props.theme.border.thin};
  }

  @media (max-width: ${SMALL_SCREEN_BREAKPOINT}px) {
    .euiAccordion__triggerWrapper {
      width: 650px;
    }
  }
`;
