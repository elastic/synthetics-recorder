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

import { EuiFlexGroup, EuiFlexItem, EuiText, EuiCodeBlock, EuiAccordion } from '@elastic/eui';
import React from 'react';
import type { StepStatus } from '../../../common/types';
import { symbols } from './styles';
import { css } from '@emotion/react';

function removeColorCodes(str = '') {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[.*?m/g, '');
}

interface IResultErrorBody {
  code: string;
  errorMessage?: string;
  actionTitles: string[];
  resultCategory: StepStatus;
  stepIndex: number;
  stepName: string;
}

export function ResultErrorBody({
  actionTitles,
  code,
  errorMessage,
  resultCategory,
  stepIndex,
  stepName,
}: IResultErrorBody) {
  return (
    <>
      <EuiFlexGroup direction="column" gutterSize="none">
        {actionTitles.map((name, index) => (
          <EuiFlexGroup
            css={css`
              margin: 8px 8px 4px 8px;
            `}
            alignItems="center"
            gutterSize="xs"
            key={name + index}
          >
            <EuiFlexItem grow={false}>{symbols[resultCategory]}</EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">{name}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        ))}
      </EuiFlexGroup>
      <EuiAccordion
        css={css`
          margin: 0px 10px 0px 4px;
        `}
        id={stepName}
        initialIsOpen
        buttonContent="Step code"
        key={stepIndex}
        paddingSize="s"
        buttonClassName="euiAccordionForm__button"
      >
        {errorMessage && (
          <>
            <EuiCodeBlock language="js" paddingSize="m" whiteSpace="pre">
              {code}
            </EuiCodeBlock>
            <EuiCodeBlock paddingSize="m">{removeColorCodes(errorMessage)}</EuiCodeBlock>
          </>
        )}
      </EuiAccordion>
    </>
  );
}
