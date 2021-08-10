import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiAccordion,
  EuiButtonIcon,
  EuiFieldText,
} from "@elastic/eui";

function StepDetails({ action = {}, onStepDetailChange, index }) {
  const [selector, setSelector] = useState(action.selector || "");
  const [text, setText] = useState(action.text || "");

  const onSelectorChange = (value) => {
    if (!value) {
      return;
    }
    setSelector(value);
    action.selector = value;
    onStepDetailChange(action, index);
  };

  const onTextChange = (value) => {
    if (!value) {
      return;
    }
    setText(value);
    action.text = value;
    onStepDetailChange(action, index);
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
  const extraAction = (
    <EuiButtonIcon
      iconType="heart"
      color="danger"
      className="euiAccordionForm__extraAction"
      aria-label="Delete"
    />
  );

  return steps.map((step, index) => (
    <EuiAccordion
      key={index}
      className="euiAccordionForm"
      buttonContent={step.title}
      buttonClassName="euiAccordionForm__button"
      extraAction={extraAction}
    >
      <StepDetails
        action={step.action}
        index={index}
        onStepDetailChange={onStepDetailChange}
      />
    </EuiAccordion>
  ));
}
