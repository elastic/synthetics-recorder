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

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../helpers/test';
import { TruncatedTitle } from './TruncatedTitle';

describe('<TruncatedTitle />', () => {
  it(`renders the full string if it's less than max length`, () => {
    const { getByText } = render(
      <TruncatedTitle maxLength={100} stepIndex={0} text="Hello World!" />
    );

    expect(getByText('1: Hello World!'));
  });

  it(`renders a truncated string with a tooltip if it's greater than max length`, async () => {
    const { getByText } = render(
      <TruncatedTitle maxLength={20} stepIndex={0} text="Four score and eleven years ago" />
    );

    const truncatedElement = getByText('1: Four score and eleve…');

    fireEvent.mouseOver(truncatedElement);

    await waitFor(() => {
      expect(getByText('Four score and eleven years ago'));
    });
  });
});
