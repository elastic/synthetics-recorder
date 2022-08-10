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

// import type { Step } from '@elastic/synthetics';
import type { Step } from '../../../common/types';
import React, { useState } from 'react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useStepResultStatus } from '../../hooks/useTestResult';
import { ActionElement } from '../ActionElement';
import { SeparatorActions } from './SeparatorActions';
import { StepSeparatorAccordion } from './styles';

interface IStepSeparator {
  index: number;
  step: Step;
}

export function StepSeparator({ index, step }: IStepSeparator) {
  const testStatus = useStepResultStatus(
    step.actions.length ? step.actions[0].title : undefined,
    step.name
  );
  const [showControls, setShowControls] = useState(false);
  const [canDelete, setCanDelete] = useState(true);
  const { isDraggable } = useDragAndDrop(index);

  return (
    <div onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      <StepSeparatorAccordion
        extraAction={
          <SeparatorActions
            canDelete={canDelete}
            index={index}
            isDraggable={isDraggable}
            showControls={showControls}
            step={step}
          />
        }
        id={`step-separator-${index}`}
        initialIsOpen
        onToggle={isOpen => setCanDelete(isOpen)}
      >
        {step.actions.map((actionContext, actionIndex) => (
          <ActionElement
            key={`action-${actionIndex}-for-step-${index}`}
            actionContext={actionContext}
            actionIndex={actionIndex}
            stepIndex={index}
            testStatus={testStatus}
            isLast={actionIndex === step.actions.length - 1}
          />
        ))}
      </StepSeparatorAccordion>
    </div>
  );
}
