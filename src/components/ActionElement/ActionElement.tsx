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

import { EuiFlexGroup, EuiFlexItem, EuiAccordion } from "@elastic/eui";
import React, { useCallback, useContext, useState } from "react";
import styled from "styled-components";
import {
  DRAG_AND_DROP_DATA_TRANSFER_TYPE,
  SMALL_SCREEN_BREAKPOINT,
} from "../../common/shared";
import {
  ActionContext,
  ResultCategory,
  StepSeparatorDragDropDataTransfer,
} from "../../common/types";
import { DragAndDropContext } from "../../contexts/DragAndDropContext";
import { StepsContext } from "../../contexts/StepsContext";
import { useDrop } from "../../hooks/useDrop";
import { ActionDetail } from "../ActionDetail";
import { ActionStatusIndicator } from "../ActionStatusIndicator";
import { Assertion } from "../Assertion";
import { ActionWrapper } from "./ActionWrapper";
import { ExtraActions } from "./ExtraActions";
import { NewStepDividerButton } from "./NewStepDividerButton";

interface IActionElement {
  actionIndex: number;
  className?: string;
  initialIsOpen?: boolean;
  isDragging?: boolean;
  step: ActionContext;
  stepIndex: number;
  testStatus?: ResultCategory;
}

const ActionAccordion = styled(EuiAccordion)`
  padding: 8px 0px;
`;

const Container = styled(EuiFlexGroup)`
  display: flex;
  min-height: 50px;
  min-width: 800px;
  margin-left: -63px;
  overflow: visible;
`;

interface DropZoneStyleProps {
  isDraggedOver: boolean;
}

const DropZone = styled.div<DropZoneStyleProps>`
  height: 8px;
  border-radius: 4px;
  ${({ isDraggedOver, theme }) =>
    isDraggedOver &&
    `
    background-color: ${theme.colors.accent};
    opacity: 1;
    transition: background-color 0.3s;
  `}
  ${({ isDraggedOver, theme }) =>
    !isDraggedOver &&
    `
    background-color: ${theme.colors.success};
    opacity: 0.75;
    transition: background-color 0.3s;
  `}
`;

function ActionComponent({
  actionIndex,
  className,
  initialIsOpen,
  step,
  stepIndex,
  testStatus,
}: IActionElement) {
  const { onDeleteAction, onSplitStep, onDropStep } = useContext(StepsContext);
  const [isOpen, setIsOpen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const close = () => setIsOpen(false);
  const splitStepAtAction = useCallback(() => {
    onSplitStep(stepIndex, actionIndex);
  }, [actionIndex, onSplitStep, stepIndex]);
  const { isDroppable } = useDrop(stepIndex, actionIndex);
  const { isDragInProgress } = useContext(DragAndDropContext);
  // TODO: move this drop zone component to dedicated file
  const [dropzoneOver, setDropzeonOver] = useState(false);

  return (
    <Container className={className} gutterSize="none">
      <EuiFlexItem grow={false}>
        <NewStepDividerButton
          actionIndex={actionIndex}
          onClick={splitStepAtAction}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        {!step.action.isAssert && <ActionStatusIndicator status={testStatus} />}
      </EuiFlexItem>
      <ActionWrapper isAssert={step.action.isAssert}>
        <ActionAccordion
          arrowDisplay="none"
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
            <ExtraActions
              actionIndex={actionIndex}
              areControlsVisible={areControlsVisible}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              step={step}
              stepIndex={stepIndex}
            />
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
        {isDroppable && isDragInProgress && (
          <DropZone
            isDraggedOver={dropzoneOver}
            onDragOver={e => {
              e.preventDefault();
            }}
            onDragLeave={_ => {
              setDropzeonOver(false);
            }}
            onDragEnter={e => {
              setDropzeonOver(true);
              e.preventDefault();
            }}
            onDrop={e => {
              const { initiatorIndex } = JSON.parse(
                e.dataTransfer.getData(DRAG_AND_DROP_DATA_TRANSFER_TYPE)
              ) as StepSeparatorDragDropDataTransfer;
              setDropzeonOver(false);
              onDropStep(stepIndex, initiatorIndex, actionIndex);
              e.preventDefault();
            }}
          />
        )}
      </ActionWrapper>
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

  .euiAccordion-isOpen > .euiAccordion__childWrapper {
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
