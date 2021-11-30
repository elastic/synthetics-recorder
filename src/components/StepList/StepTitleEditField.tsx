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
import { useEffect, useRef, useState } from "react";
import { EuiFieldText } from "@elastic/eui";
import { Setter } from "../../common/types";

interface IStepTitleEditField {
  onStepTitleChange: (text: string) => void;
  setIsEditing: Setter<boolean>;
  title: string;
}

export function StepTitleEditField({
  onStepTitleChange,
  setIsEditing,
  title,
}: IStepTitleEditField) {
  const [tempText, setTempText] = useState<string>(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  function updateTitle() {
    onStepTitleChange(tempText);
    setIsEditing(false);
  }

  return (
    <EuiFieldText
      aria-label="Sets the title for the current step."
      onKeyDown={e => {
        if (e.key === "Enter") {
          updateTitle();
        } else if (e.key === "Escape") {
          setIsEditing(false);
        }
      }}
      onBlur={updateTitle}
      onChange={e => {
        setTempText(e.target.value);
      }}
      placeholder={title}
      inputRef={inputRef}
      style={{ minWidth: 350 }}
      value={tempText}
    />
  );
}
