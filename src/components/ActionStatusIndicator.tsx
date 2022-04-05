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

import { EuiThemeComputed, EuiThemeContext } from '@elastic/eui';
import React, { useContext } from 'react';
import { ResultCategory } from '../common/types';

interface IActionStatusIndicator {
  /**
   * If true, indicator will render a rect overtop of the normal position
   * of the `ActionElement` border.
   *
   * We use this to replace the border of elements where we don't want a line
   * running down the entire side.
   */
  showRect?: boolean;
  status?: ResultCategory;
}

export function ActionStatusIndicator({ showRect, status }: IActionStatusIndicator) {
  const euiTheme = useContext(EuiThemeContext);

  return (
    <svg width="50" height="62" style={{ left: 26, top: 0, position: 'relative' }}>
      {!!showRect && (
        <rect
          x="24"
          width="2"
          height="40"
          y="0"
          style={{ fill: euiTheme.colors.lightShade, stroke: 'none' }}
        />
      )}
      <circle cx="25" cy="37" r="12" fill={euiTheme.colors.lightestShade} />
      <circle cx="25" cy="37" r="3" fill={getColorForStatus(euiTheme, status)} />
    </svg>
  );
}

function getColorForStatus(euiTheme: EuiThemeComputed, status?: ResultCategory) {
  if (!status) return euiTheme.colors.darkestShade;
  switch (status) {
    case 'succeeded':
      return euiTheme.colors.success;
    case 'skipped':
      return euiTheme.colors.warning;
    case 'failed':
      return euiTheme.colors.danger;
    default:
      return euiTheme.colors.darkestShade;
  }
}
