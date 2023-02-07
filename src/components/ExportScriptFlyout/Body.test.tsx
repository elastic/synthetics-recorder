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
import { Body } from './Body';

describe('Body', () => {
  it('renders a checkbox with the correct label and checked state', () => {
    const code = 'const foo = "bar";';
    const exportAsProject = true;
    const setExportAsProject = jest.fn();
    const { getByLabelText } = render(
      <Body code={code} exportAsProject={exportAsProject} setExportAsProject={setExportAsProject} />
    );

    expect(getByLabelText('Export as project'));
  });

  it('calls the setExportAsProject prop when the checkbox is clicked', () => {
    const code = 'const foo = "bar";';
    const exportAsProject = true;
    const setExportAsProject = jest.fn();
    const { getByLabelText } = render(
      <Body code={code} exportAsProject={exportAsProject} setExportAsProject={setExportAsProject} />
    );

    const checkbox = getByLabelText('Export as project');
    fireEvent.click(checkbox);
    expect(setExportAsProject).toHaveBeenCalledWith(false);
  });

  it('renders a code block with the correct code', () => {
    const code = 'const foo = "bar";';
    const exportAsProject = true;
    const setExportAsProject = jest.fn();
    const { getByLabelText } = render(
      <Body code={code} exportAsProject={exportAsProject} setExportAsProject={setExportAsProject} />
    );

    const codeBlock = getByLabelText('Code to export');
    const content = Array.from(codeBlock.childNodes.entries()).map(e => e[1].textContent);
    expect(content).toHaveLength(1);
    expect(content[0]).toEqual(code);
  });
});
