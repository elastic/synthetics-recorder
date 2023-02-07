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
import { render, fireEvent } from '@testing-library/react';
import { EditStepNameInput } from './EditStepNameInput';

describe('EditStepNameInput', () => {
  it('renders the default value', () => {
    const { getByPlaceholderText } = render(
      <EditStepNameInput
        defaultValue={'test value'}
        onComplete={jest.fn()}
        placeholder="Test placeholder"
      />
    );
    expect(getByPlaceholderText('Test placeholder').getAttribute('value')).toBe('test value');
  });

  it('calls onComplete with entered value on "Enter" key', () => {
    const onComplete = jest.fn();
    const { getByPlaceholderText } = render(
      <EditStepNameInput onComplete={onComplete} placeholder="Test placeholder" />
    );
    const input = getByPlaceholderText('Test placeholder');
    fireEvent.change(input, { target: { value: 'test value' } });
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(onComplete).toHaveBeenCalledWith('test value');
  });

  it('calls onComplete with null on "Escape" key', () => {
    const onComplete = jest.fn();
    const { getByPlaceholderText } = render(
      <EditStepNameInput onComplete={onComplete} placeholder="Test placeholder" />
    );
    const input = getByPlaceholderText('Test placeholder');
    fireEvent.change(input, { target: { value: 'test value' } });
    fireEvent.keyUp(input, { key: 'Escape' });
    expect(onComplete).toHaveBeenCalledWith(null);
  });

  it('calls onComplete with entered value on save button click', () => {
    const onComplete = jest.fn();
    const { getByPlaceholderText, getByLabelText } = render(
      <EditStepNameInput onComplete={onComplete} placeholder="Test placeholder" />
    );
    const input = getByPlaceholderText('Test placeholder');
    fireEvent.change(input, { target: { value: 'test value' } });
    fireEvent.click(getByLabelText('Apply changes'));
    expect(onComplete).toHaveBeenCalledWith('test value');
  });

  it('calls onComplete with null on cancel button click', () => {
    const onComplete = jest.fn();
    const { getByLabelText } = render(
      <EditStepNameInput onComplete={onComplete} placeholder="Test placeholder" />
    );
    fireEvent.click(getByLabelText('Cancel edit'));
    expect(onComplete).toHaveBeenCalledWith(null);
  });
});
