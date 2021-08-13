import React from "react";
import { EuiAccordion, EuiButtonIcon } from "@elastic/eui";
import { ActionDetail } from "./ActionDetail";

function StepDetail({ step, stepIndex, onStepDetailChange }) {
  const onActionContextChange = (actionContext, actionIndex) => {
    step[actionIndex] = actionContext;
    onStepDetailChange(step, stepIndex);
  };

  return step.map((actionContext, index) => (
    <ActionDetail
      key={index}
      actionContext={actionContext}
      actionIndex={index}
      onActionContextChange={onActionContextChange}
    ></ActionDetail>
  ));
}

export function StepAccordions({ steps, onStepDetailChange, onStepDelete }) {
  return steps.map((step, index) => {
    const { title } = step[0];
    return (
      <EuiAccordion
        id={title}
        key={index}
        buttonContent={title}
        paddingSize="l"
        className="euiAccordionForm"
        buttonClassName="euiAccordionForm__button"
        extraAction={
          <EuiButtonIcon
            iconType="cross"
            color="danger"
            className="euiAccordionForm__extraAction"
            aria-label="Delete"
            onClick={() => onStepDelete(index)}
          />
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
