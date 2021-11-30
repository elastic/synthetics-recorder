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
import { EuiCode, EuiEmptyPrompt, EuiSpacer, EuiTitle } from "@elastic/eui";

import { StepAccordions } from "./StepList/StepDetails";
import { StepsContext } from "../contexts/StepsContext";
import type { ActionContext } from "../common/types";

export function Steps() {
  const { actions, setActions } = useContext(StepsContext);

  const onStepDetailChange = (step: ActionContext[], stepIndex: number) => {
    const newActions = actions.map((a, ind) => (ind === stepIndex ? step : a));
    setActions(newActions);
  };

  const onStepDelete = (stepIndex: number) => {
    const newActions = [
      ...actions.slice(0, stepIndex),
      ...actions.slice(stepIndex + 1),
    ];
    setActions(newActions);
  };

  if (actions.length === 0) {
    return (
      <EuiEmptyPrompt
        aria-label="This empty prompt indicates that you have not recorded any journey steps yet."
        title={<h3>No steps recorded yet</h3>}
        body={
          <p>
            Click on <EuiCode>Start recording</EuiCode> to get started with your
            script.
          </p>
        }
      />
    );
  }

  return (
    <>
      <EuiTitle size="s">
        <h2>
          {actions.length}&nbsp;
          {actions.length === 1 ? "Recorded Step" : "Recorded Steps"}
        </h2>
      </EuiTitle>
      <EuiSpacer />
      <StepAccordions
        steps={actions}
        onStepDetailChange={onStepDetailChange}
        onStepDelete={onStepDelete}
      />
    </>
  );
}
