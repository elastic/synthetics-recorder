import React from "react";
import { useContext, useMemo, useState } from "react";
import {
  EuiAccordion,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
} from "@elastic/eui";
import "./StepList.css";
import { ActionDetail } from "../ActionDetail";
import { StepAccordionTitle } from "./StepAccordionTitle";
import "./StepDetails.css";
import { RecordingContext } from "../../contexts/RecordingContext";
import type { ActionContext } from "../../common/types";

interface IStepDetail {
  step: ActionContext[];
  stepIndex: number;
  onStepDetailChange: StepChangeHandler;
}

function StepDetail({ step, stepIndex, onStepDetailChange }: IStepDetail) {
  const assertionNumberTable = useMemo(() => {
    let assertionCount = 0;
    return step.reduce<Record<number, number>>(
      (table, actionContext, index) => {
        if (actionContext.action.isAssert) {
          table[index] = ++assertionCount;
        }
        return table;
      },
      {}
    );
  }, [step]);

  const onActionContextChange = (
    actionContext: ActionContext,
    actionIndex: number
  ) => {
    onStepDetailChange(
      step.map((a, index) => (index === actionIndex ? actionContext : a)),
      stepIndex
    );
  };

  return (
    <>
      {step.map((actionContext, index) => (
        <ActionDetail
          key={index}
          actionContext={actionContext}
          actionIndex={index}
          assertionCount={assertionNumberTable[index]}
          onActionContextChange={onActionContextChange}
          stepIndex={stepIndex}
        />
      ))}
    </>
  );
}

type StepDeleteHandler = (stepIndex: number) => void;
type StepChangeHandler = (step: ActionContext[], stepIndex: number) => void;

interface IStepAccordion {
  title: string;
  index: number;
  onStepDetailChange: StepChangeHandler;
  onStepDelete: StepDeleteHandler;
  step: ActionContext[];
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
  const { isRecording } = useContext(RecordingContext);
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
                isRecording
                  ? "Delete this step. You cannot delete steps until you end the recording session."
                  : "Delete this step."
              }
              className="euiAccordionForm__extraAction"
              // @ts-expect-error using EUI theme colors
              color={darkShade}
              isDisabled={isRecording}
              iconType="trash"
              onClick={() => onStepDelete(index)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <StepDetail
        step={step}
        stepIndex={index}
        onStepDetailChange={onStepDetailChange}
      />
    </EuiAccordion>
  );
}

interface IStepAccordions {
  steps: ActionContext[][];
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
