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

import React from "react";
import { useContext, useState } from "react";
import {
  EuiAccordion,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
} from "@elastic/eui";
import { ActionDetail } from "../ActionDetail";
import { StepAccordionTitle } from "./StepAccordionTitle";
import "./StepDetails.css";
import { RecordingContext } from "../../contexts/RecordingContext";
import { RecordingStatus } from "../../common/types";
import type { Step, Steps } from "../../common/types";

interface IStepDetail {
  step: Step;
  stepIndex: number;
}

function StepDetail({ step, stepIndex }: IStepDetail) {
  return (
    <>
      {step.map((actionContext, index) => (
        <ActionDetail
          key={index}
          actionContext={actionContext}
          actionIndex={index}
          stepIndex={stepIndex}
        />
      ))}
    </>
  );
}

type StepDeleteHandler = (stepIndex: number) => void;
type StepChangeHandler = (step: Step, stepIndex: number) => void;

interface IStepAccordion {
  title: string;
  index: number;
  onStepDetailChange: StepChangeHandler;
  onStepDelete: StepDeleteHandler;
  step: Step;
}

function StepAccordion({
  title,
  index,
  onStepDetailChange,
  onStepDelete,
  step,
}: IStepAccordion) {
  const {
    euiTheme: {
      border: {
        thin,
        radius: { medium },
      },
    },
  } = useEuiTheme();
  const { recordingStatus } = useContext(RecordingContext);
  const [isEditing, setIsEditing] = useState(false);
  const onStepTitleChange = (updatedTitle: string) => {
    onStepDetailChange(
      step.map((s, stepIdx) => {
        if (stepIdx === 0) {
          return { ...s, title: updatedTitle, modified: true };
        }
        return s;
      }),
      index
    );
  };

  const {
    euiTheme: {
      colors: { darkShade },
    },
  } = useEuiTheme();

  return (
    <EuiAccordion
      id={title}
      key={index}
      style={{
        border: thin,
        borderRadius: medium,
        margin: "8px 0px",
      }}
      paddingSize="m"
      className="euiAccordionForm stepAccordion"
      buttonClassName="euiAccordionForm__button"
      extraAction={
        <EuiFlexGroup alignItems="center" direction="row" gutterSize="xs">
          <EuiFlexItem grow={false}>
            <StepAccordionTitle
              index={index}
              isEditing={isEditing}
              onStepTitleChange={onStepTitleChange}
              setIsEditing={setIsEditing}
              title={title}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButtonIcon
              aria-label="Edit the step's name"
              className="euiAccordionForm__extraAction"
              // @ts-expect-error using EUI theme colors
              color={darkShade}
              iconType="pencil"
              onClick={() => {
                if (!isEditing) setIsEditing(true);
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              aria-label={
                recordingStatus === RecordingStatus.Recording
                  ? "Delete this step. You cannot delete steps until you end the recording session."
                  : "Delete this step."
              }
              className="euiAccordionForm__extraAction"
              // @ts-expect-error using EUI theme colors
              color={darkShade}
              isDisabled={recordingStatus === RecordingStatus.Recording}
              iconType="trash"
              onClick={() => onStepDelete(index)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <StepDetail step={step} stepIndex={index} />
    </EuiAccordion>
  );
}

interface IStepAccordions {
  steps: Steps;
  onStepDelete: StepDeleteHandler;
  onStepDetailChange: StepChangeHandler;
}

export function StepAccordions({
  steps,
  onStepDelete,
  onStepDetailChange,
}: IStepAccordions) {
  return (
    <>
      {steps.map((step, index) => {
        const { title } = step[0];
        return (
          <StepAccordion
            index={index}
            key={index}
            onStepDelete={onStepDelete}
            onStepDetailChange={onStepDetailChange}
            step={step}
            title={title || ""}
          />
        );
      })}
    </>
  );
}
