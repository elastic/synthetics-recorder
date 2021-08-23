import React from "react";
import { EuiAccordion, EuiButtonIcon, EuiButton } from "@elastic/eui";
import { ActionDetail } from "./ActionDetail";

function StepDetail({ step, stepIndex, onStepDetailChange }) {
  const onAddAssertion = () => {
    const previousAction = step[step.length - 1];
    const newStep = [
      ...step,
      {
        pageAlias: previousAction.pageAlias,
        isMainFrame: previousAction.isMainFrame,
        frameUrl: previousAction.frameUrl,
        action: {
          name: "assert",
          isAssert: true,
          selector: previousAction.action?.selector,
          command: "",
          value: "",
          signals: [],
        },
      },
    ];
    onStepDetailChange(newStep, stepIndex);
  };

  const onActionContextChange = (actionContext, actionIndex) => {
    step[actionIndex] = actionContext;
    onStepDetailChange(step, stepIndex);
  };

  return (
    <>
      {step.map((actionContext, index) => (
        <ActionDetail
          key={index}
          actionContext={actionContext}
          actionIndex={index}
          onActionContextChange={onActionContextChange}
        ></ActionDetail>
      ))}
      <EuiButton fill onClick={onAddAssertion} color="secondary">
        Add assertion
      </EuiButton>
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
