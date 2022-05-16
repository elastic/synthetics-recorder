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

import { EuiFlexGroup, EuiFlexItem, EuiAccordion } from '@elastic/eui';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';
import { SMALL_SCREEN_BREAKPOINT } from '../../common/shared';
import { ResultCategory } from '../../common/types';
import { ActionContext } from '../../../common/types';
import { StepsContext } from '../../contexts/StepsContext';
import { useDrop } from '../../hooks/useDrop';
import { ActionDetail } from '../ActionDetail';
import { ActionStatusIndicator } from '../ActionStatusIndicator';
import { Assertion } from '../Assertion';
import { Behavior } from './Behavior';
import { ExtraActions } from './ExtraActions';
import { NewStepDividerButton } from './NewStepDividerButton';

const ActionAccordion = styled(EuiAccordion)<{ isDragOver: boolean }>`
  padding: 8px 0px;
  .euiAccordion__triggerWrapper {
    border-top-left-radius: ${props => props.theme.border.radius.medium};
    border-top-right-radius: ${props => props.theme.border.radius.medium};
    border: ${props => props.theme.border.thin};
    padding: 12px;
    background-color: ${props => props.theme.colors.emptyShade};
  }

  border-bottom: ${({ isDragOver, theme }) =>
    isDragOver ? `${theme.border.width.thick} solid ${theme.colors.success}` : 'inherit'};

  .euiAccordion__padding--m {
    background-color: ${props => props.theme.colors.emptyShade};
    border-right: ${props => props.theme.border.thin};
    border-bottom: ${props => props.theme.border.thin};
    border-left: ${props => props.theme.border.thin};
  }

  .euiAccordion-isOpen > .euiAccordion__childWrapper {
    border-right: ${props => props.theme.border.thin};
    border-bottom: ${props => props.theme.border.thin};
    border-left: ${props => props.theme.border.thin};
    background-color: ${props => props.theme.colors.emptyShade};
  }
`;

interface IContainer {
  isDragOver: boolean;
}

const Container = styled(EuiFlexGroup)<IContainer>`
  display: flex;
  min-height: 50px;
  min-width: 800px;
  margin-left: -63px;
  overflow: visible;
`;

interface IActionElement {
  actionIndex: number;
  className?: string;
  isDragging?: boolean;
  actionContext: ActionContext;
  isLast?: boolean;
  stepIndex: number;
  testStatus?: ResultCategory;
}

function ActionComponent({
  actionIndex,
  className,
  isLast,
  actionContext,
  stepIndex,
  testStatus,
}: IActionElement) {
  const { onDeleteAction, onUpdateAction, onSetActionIsOpen } = useContext(StepsContext);
  const isAssertion = actionContext.action.isAssert;
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const setIsOpen = useCallback(
    (isOpen: boolean) => {
      onSetActionIsOpen(stepIndex, actionIndex, isOpen);
    },
    [actionIndex, stepIndex, onSetActionIsOpen]
  );
  const close = () => setIsOpen(false);
  const { isDragOver, onDropActions, splitStepAtAction } = useDrop(stepIndex, actionIndex);

  if (actionContext?.isSoftDeleted) {
    return null;
  }

  return (
    <Container
      className={className}
      isDragOver={isDragOver}
      id={`action-element-${stepIndex}-${actionIndex}`}
      gutterSize="none"
      {...onDropActions}
    >
      <EuiFlexItem grow={false}>
        <NewStepDividerButton
          actionIndex={actionIndex}
          stepIndex={stepIndex}
          onClick={splitStepAtAction}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <ActionStatusIndicator showRect={isLast} status={testStatus} />
      </EuiFlexItem>
      <Behavior isAssert={isAssertion} omitBorder={isLast}>
        <ActionAccordion
          isDragOver={isDragOver}
          arrowDisplay="none"
          buttonProps={{ style: { display: 'none' } }}
          paddingSize="m"
          id={`step-accordion-${actionContext.title}`}
          initialIsOpen={actionContext.isOpen}
          forceState={actionContext.isOpen ? 'open' : 'closed'}
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
              isOpen={actionContext.isOpen ?? false}
              setIsOpen={setIsOpen}
              actionContext={actionContext}
              stepIndex={stepIndex}
            />
          }
        >
          {!actionContext.action.isAssert && actionContext.isOpen && (
            <ActionDetail
              actionContext={actionContext}
              actionIndex={actionIndex}
              close={close}
              stepIndex={stepIndex}
            />
          )}
          {actionContext.action.isAssert && actionContext.isOpen && (
            <Assertion
              actionIndex={actionIndex}
              actionContext={actionContext}
              close={close}
              onDeleteAction={onDeleteAction}
              saveAssertion={(updatedAction: ActionContext) => {
                onUpdateAction(updatedAction, stepIndex, actionIndex);
              }}
              stepIndex={stepIndex}
            />
          )}
        </ActionAccordion>
      </Behavior>
    </Container>
  );
}

export const ActionElement = styled(ActionComponent)`
  @media (max-width: ${SMALL_SCREEN_BREAKPOINT}px) {
    .euiAccordion__triggerWrapper {
      width: 650px;
    }
  }
`;
