import React from "react";
import { EuiAccordion } from "@elastic/eui";
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

export function StepAccordions({ steps, onStepDetailChange }) {
  return steps.map((step, index) => {
    const { title } = step[0];
    return (
      <EuiAccordion
        id={title}
        key={index}
        buttonContent={title}
        paddingSize="l"
        buttonClassName="euiAccordionForm__button"
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
