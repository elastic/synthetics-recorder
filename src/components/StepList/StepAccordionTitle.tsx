/**
 * MIT License
 *
 * Copyright (c) 2021-present, Elastic NV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { StepTitleEditField } from "./StepTitleEditField";
import { Setter } from "../../common/types";

interface IStepAccordionTitle {
  index: number;
  isEditing: boolean;
  onStepTitleChange: (updatedTitle: string) => void;
  setIsEditing: Setter<boolean>;
  title: string;
}

export function StepAccordionTitle({
  index,
  isEditing,
  onStepTitleChange,
  setIsEditing,
  title,
}: IStepAccordionTitle) {
  const stepIndexString = `Step ${index + 1}`;
  if (isEditing) {
    return (
      <EuiFlexGroup alignItems="baseline">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <strong>{stepIndexString}</strong>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <StepTitleEditField
            onStepTitleChange={onStepTitleChange}
            setIsEditing={setIsEditing}
            title={title}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiText style={{ marginTop: 1 }} size="s">
      <strong style={{ marginRight: 38 }}>{stepIndexString}</strong>
      {title}
    </EuiText>
  );
}
