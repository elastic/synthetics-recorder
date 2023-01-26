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

import { screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../helpers/test';
import { ResultTitle } from './ResultTitle';

describe('<ResultTitle />', () => {
  const titleText = 'Test Result';
  const stepIndex = 1;
  const maxTitleLength = 20;
  const durationElement = <div data-testid="duration">10s</div>;
  const children = <div data-testid="children">Additional Content</div>;

  it('renders the title, duration and children', () => {
    const { getByText, getByTestId } = render(
      <ResultTitle
        maxTitleLength={maxTitleLength}
        stepIndex={stepIndex}
        titleText={titleText}
        durationElement={durationElement}
      >
        {children}
      </ResultTitle>
    );

    expect(getByText(`2: ${titleText.substring(0, maxTitleLength)}`));

    expect(screen.getByTestId('duration'));

    expect(getByTestId('children'));
  });
});
