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

import { fireEvent } from '@testing-library/react';
import React from 'react';
import { render } from '../../helpers/test';
import { FormControl } from './FormControl';

describe('<FormControl />', () => {
  it('Displays the label', () => {
    const { getByText } = render(
      <FormControl label="Test label" name="Test name" onChange={jest.fn()} value="Test value" />
    );

    expect(getByText('Test label'));
    expect(getByText('Test name'));
  });

  it('handles `onChange`', async () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <FormControl label="Test label" name="Test name" onChange={onChange} value="Test value" />
    );

    const textElement = getByRole('textbox');

    fireEvent.change(textElement, { target: { value: 'updated value' } });

    expect(onChange).toHaveBeenCalled();
  });
});
