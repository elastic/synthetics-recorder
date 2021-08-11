import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiAccordion,
  EuiButtonIcon,
  EuiFieldText,
} from "@elastic/eui";
import { actionTitle } from "../helpers/generator";

function StepDetails({ step, onStepDetailChange, index }) {
  const { action } = step;
  const [selector, setSelector] = useState(action.selector || "");
  const [text, setText] = useState(action.text || "");

  const onSelectorChange = (value) => {
    if (!value) {
      return;
    }
    setSelector(value);
    action.selector = value;
    onStepDetailChange(step, index);
  };

  const onTextChange = (value) => {
    if (!value) {
      return;
    }
    setText(value);
    action.text = value;
    onStepDetailChange(step, index);
  };

  return action.selector ? (
    <>
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem grow={false}>
          <EuiText size="s">Selector</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFieldText
            value={selector}
            onChange={(e) => onSelectorChange(e.target.value)}
          ></EuiFieldText>
        </EuiFlexItem>
      </EuiFlexGroup>
      {action.text ? (
        <EuiFlexGroup alignItems="baseline">
          <EuiFlexItem grow={false}>
            <EuiText size="s">Text</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFieldText
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
            ></EuiFieldText>
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        ""
      )}
    </>
  ) : (
    ""
  );
}

export function StepAccordions({ steps, onStepDetailChange }) {
  return steps.map((step, index) => {
    const title = actionTitle(step.action);
    return (
      <EuiAccordion
        id={title}
        key={index}
        className="euiAccordionForm"
        buttonContent={title}
        buttonClassName="euiAccordionForm__button"
      >
        <StepDetails
          step={step}
          index={index}
          onStepDetailChange={onStepDetailChange}
        />
      </EuiAccordion>
    );
  });
}
