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

import { EuiFlexGroup, EuiFlexItem, EuiPanel, useEuiTheme } from '@elastic/eui';
import React from 'react';
import { TruncatedTitle } from './TruncatedTitle';
import { css } from '@emotion/react';

interface IResultHeader {
  children: React.ReactNode;
  durationElement?: JSX.Element;
  maxTitleLength: number;
  titleText: string;
  stepIndex: number;
}

export const ResultTitle: React.FC<IResultHeader> = ({
  children,
  durationElement,
  maxTitleLength,
  stepIndex,
  titleText,
}) => {
  const { euiTheme: theme } = useEuiTheme();
  return (
    <EuiPanel
      css={css`
        && {
          border-radius: ${theme.border.radius.medium};
        }
        padding: 0px;
        margin: 0px 0px 24px 0px;
        border: ${theme.border.thin};
      `}
      hasShadow={false}
    >
      <h3
        css={css`
          border-bottom: ${theme.border.thin};
          padding: 8px;
        `}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <TruncatedTitle maxLength={maxTitleLength} stepIndex={stepIndex} text={titleText} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>{durationElement}</EuiFlexItem>
        </EuiFlexGroup>
      </h3>
      {children}
    </EuiPanel>
  );
};
