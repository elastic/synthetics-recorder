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

import { EuiButtonIcon, useEuiTheme } from '@elastic/eui';
import React from 'react';
import { css } from '@emotion/react';

interface Props {
  actionIndex: number;
  stepIndex: number;
  onClick: () => void;
}

export function NewStepDividerButton({ actionIndex, stepIndex, onClick }: Props) {
  const { euiTheme: theme } = useEuiTheme();
  const computedvisibility = actionIndex > 0 ? 'visible' : 'hidden';
  return (
    <EuiButtonIcon
      css={css`
        background-color: ${theme.colors.body};
        position: relative;
        left: 63px;
        top: -8px;
        visibility: ${computedvisibility};
        z-index: 1;
      `}
      aria-label="Insert a step between actions. Use this button to group actions into logical steps"
      color="text"
      iconType="plusInCircle"
      id={`insert-divider-${stepIndex}-${actionIndex}`}
      onClick={onClick}
    />
  );
}
