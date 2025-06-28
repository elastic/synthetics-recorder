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
import { EuiFlexItem, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import React from 'react';

interface IActionWrapper {
  children: React.ReactNode;
  isAssert?: boolean;
  omitBorder?: boolean;
}

export const Behavior: React.FC<IActionWrapper> = ({ children, isAssert, omitBorder }) => {
  const { euiTheme: theme } = useEuiTheme();
  if (isAssert)
    return (
      <EuiFlexItem
        css={css`
          border-left: ${theme.border.thick};
          padding-left: 20px;
        `}
      >
        {children}
      </EuiFlexItem>
    );
  if (omitBorder) {
    return (
      <EuiFlexItem
        css={css`
          border-left: ${theme.border.thick};
          padding-left: 20px;
          margin-left: 0px;
        `}
        style={{ borderLeft: 'none', marginLeft: 2 }}
      >
        {children}
      </EuiFlexItem>
    );
  }

  return (
    <EuiFlexItem
      css={css`
        border-left: ${theme.border.thick};
        padding-left: 20px;
        margin-left: 0px;
      `}
    >
      {children}
    </EuiFlexItem>
  );
};
