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

import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
} from "@elastic/eui";
import React, { useState } from "react";

interface IEditStepNameInput {
  defaultValue?: string;
  /**
   * Function to call when editing concludes.
   *
   * If `value` is null, the value should not change.
   * Otherwise, `value` will overwrite the previous value.
   */
  onComplete: (value?: string | null) => void;
  placeholder: string;
}
export function EditStepNameInput({
  defaultValue,
  onComplete,
  placeholder,
}: IEditStepNameInput) {
  const [editValue, setEditValue] = useState(defaultValue ?? "");
  return (
    <EuiFlexGroup
      alignItems="center"
      gutterSize="xs"
      style={{ padding: 4, marginLeft: 4 }}
    >
      <EuiFlexItem>
        <EuiFieldText
          aria-label="Enter a new name for this step"
          onChange={e => setEditValue(e.target.value)}
          onKeyUp={e => {
            switch (e.key) {
              case "Enter":
                onComplete(editValue || undefined);
                break;
              case "Escape":
                onComplete(null);
                break;
            }
          }}
          autoFocus
          placeholder={placeholder}
          value={editValue}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip content="Save">
          <EuiButtonIcon
            aria-label="Apply changes"
            iconType="check"
            onClick={() => onComplete(editValue || undefined)}
          />
        </EuiToolTip>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip content="Cancel">
          <EuiButtonIcon
            aria-label="Cancel edit"
            iconType="cross"
            onClick={() => onComplete(null)}
          />
        </EuiToolTip>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
