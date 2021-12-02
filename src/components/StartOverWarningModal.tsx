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
