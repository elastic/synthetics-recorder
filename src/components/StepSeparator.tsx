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

import type { Step } from "@elastic/synthetics";
import { EuiAccordion, EuiFlexItem, EuiFlexGroup } from "@elastic/eui";
import React from "react";
import styled from "styled-components";
import { SMALL_SCREEN_BREAKPOINT } from "../common/shared";
import { useStepResultStatus } from "../hooks/useTestResult";
import { ActionElement } from "./ActionElement";

export const StepSeparatorTopBorder = styled(EuiFlexItem)`
  border-top: ${props => props.theme.border.thin};

  && {
    margin-top: 20px;
  }

  @media (max-width: ${SMALL_SCREEN_BREAKPOINT}px) {
    max-width: 586px;
  }
`;

export const StepSeparatorAccordion = styled(EuiAccordion)`
  .euiAccordion__optionalAction {
    flex-grow: 1;
    flex-shrink: 1;
  }

  margin: 16px;
`;

export const StepSeparatorHeading = styled(EuiFlexItem)`
  font-weight: bold;
`;

interface IStepSeparator {
  index: number;
  step: Step;
}

export function StepSeparator({ index, step }: IStepSeparator) {
  const testStatus = useStepResultStatus(
    step.actions.length ? step.actions[0].title : undefined
  );

  return (
    <StepSeparatorAccordion
      buttonProps={{ style: { width: "auto", flexGrow: 0 } }}
      extraAction={
        <EuiFlexGroup>
          <StepSeparatorHeading grow={false}>
            Step {index + 1}
          </StepSeparatorHeading>
          <StepSeparatorTopBorder />
        </EuiFlexGroup>
      }
      id={`step-separator-${index}`}
      initialIsOpen
    >
      {step.actions.map((s, actionIndex) => (
        <ActionElement
          key={`action-${actionIndex}-for-step-${index}`}
          step={s}
          actionIndex={actionIndex}
          stepIndex={index}
          testStatus={testStatus}
          isLast={actionIndex === step.actions.length - 1}
        />
      ))}
    </StepSeparatorAccordion>
  );
}
