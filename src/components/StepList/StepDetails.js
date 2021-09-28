import React, { useMemo, useState } from "react";
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

function StepDetail({ step, stepIndex, onStepDetailChange }) {
  const assertionNumberTable = useMemo(() => {
    let assertionCount = 0;
    return step.reduce((table, actionContext, index) => {
      if (actionContext.action.isAssert) {
        table[index] = ++assertionCount;
      }
      return table;
    }, {});
  }, [step]);

  const onActionContextChange = (actionContext, actionIndex) => {
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

function StepAccordion({
  title,
  index,
  onStepDetailChange,
  onStepDelete,
  step,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const onStepTitleChange = updatedTitle => {
    onStepDetailChange(
      step.map((s, stepIdx) => {
        if (stepIdx === 0) {
          return { ...s, title: updatedTitle };
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
      style={{ border: "none" }}
      paddingSize="m"
      className="euiAccordionForm"
      buttonClassName="euiAccordionForm__button"
      extraAction={
        <EuiFlexGroup direction="row" gutterSize="xs">
          <EuiFlexItem grow={false}>
            <StepAccordionTitle
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              title={title}
              onStepTitleChange={onStepTitleChange}
              index={index}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={true}>
            <EuiButtonIcon
              aria-label="Edit the step's name"
              className="euiAccordionForm__extraAction"
              color={darkShade}
              iconType="pencil"
              onClick={() => {
                if (!isEditing) setIsEditing(true);
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              aria-label="Delete this step"
              className="euiAccordionForm__extraAction"
              color={darkShade}
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

export function StepAccordions({ steps, onStepDetailChange, onStepDelete }) {
  return steps.map((step, index) => {
    const { title } = step[0];
    return (
      <StepAccordion
        index={index}
        key={index}
        onStepDelete={onStepDelete}
        onStepDetailChange={onStepDetailChange}
        step={step}
        title={title}
      />
    );
  });
}
