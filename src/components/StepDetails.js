import React from "react";
import {
  EuiAccordion,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
} from "@elastic/eui";
import { ActionDetail } from "./ActionDetail";

function StepDetail({ step, stepIndex, onStepDetailChange }) {
  const onActionContextChange = (actionContext, actionIndex) => {
    onStepDetailChange(
      step.map((a, ind) => (ind === actionIndex ? actionContext : a)),
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
          onActionContextChange={onActionContextChange}
          stepIndex={stepIndex}
        />
      ))}
    </>
  );
}

export function StepAccordions({ steps, onStepDetailChange, onStepDelete }) {
  return steps.map((step, index) => {
    const { title } = step[0];
    return (
      <EuiAccordion
        id={title}
        key={index}
        style={{ border: "none" }}
        buttonContent={
          <EuiText size="s">
            <strong>Step {index + 1} </strong>
            {title}
          </EuiText>
        }
        paddingSize="m"
        className="euiAccordionForm"
        buttonClassName="euiAccordionForm__button"
        extraAction={
          <EuiFlexGroup gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                aria-label="Edit the step's name"
                // TODO: Impelement functionality
                className="euiAccordionForm__extraAction"
                iconType="wrench"
                onClick={() => {
                  // TODO: Implement
                  throw Error("edit step name not implemented");
                }}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType="cross"
                color="danger"
                className="euiAccordionForm__extraAction"
                aria-label="Delete this step"
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
  });
}
