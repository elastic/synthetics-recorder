import React from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from "@elastic/eui";
import { Setter } from "../common/types";

interface Props {
  close: Setter<boolean>;
  startOver: () => void;
  stepCount: number;
}

function headerCopy(n: number) {
  const step = n === 1 ? "step" : "steps";
  return `Delete ${n} ${step}?`;
}

export function StartOverWarningModal({
  close: setVisibility,
  startOver,
  stepCount,
}: Props) {
  if (stepCount < 1) return null;
  const close = () => setVisibility(false);
  return (
    <EuiModal onClose={close}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h3>{headerCopy(stepCount)}</h3>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>This action cannot be undone.</EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={close}>Cancel</EuiButtonEmpty>
        <EuiButton color="danger" fill onClick={startOver}>
          Delete and start over
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
