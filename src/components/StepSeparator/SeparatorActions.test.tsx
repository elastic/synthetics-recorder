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
import { SeparatorActions } from './SeparatorActions';
import { render } from '../../helpers/test';
import { createStep } from '../../../common/helper/test/createAction';
import { fireEvent, waitFor } from '@testing-library/react';

describe('SeparatorActions component', () => {
  const step = createStep(['action 1', 'action 2']);

  it('renders defaults', () => {
    const { getByLabelText, getByText } = render(
      <SeparatorActions
        canDelete={true}
        index={0}
        isDraggable={false}
        showControls={false}
        step={step}
      />
    );
    expect(getByText('Step 1'));
    expect(getByLabelText('Rename step'));
  });

  it('hides controls during drags', async () => {
    const { getByLabelText, queryByLabelText } = render(
      <SeparatorActions
        canDelete={true}
        index={1}
        isDraggable={true}
        showControls={false}
        step={step}
      />
    );

    const dragElement = getByLabelText('Drag to reorganize steps');

    fireEvent.mouseDown(dragElement);

    const setData = jest.fn();

    fireEvent.dragStart(dragElement, { dataTransfer: { setData } });

    await waitFor(() => {
      expect(queryByLabelText('Rename step')).toBeNull();
      expect(queryByLabelText('Delete step')).toBeNull();
    });

    fireEvent.dragEnd(dragElement);
    fireEvent.mouseUp(dragElement);

    expect(getByLabelText('Rename step'));
    expect(getByLabelText('Delete step'));

    expect(setData).toHaveBeenCalledTimes(2);
    expect(setData.mock.calls).toEqual([
      ['application/co.elastic.synthetics-recorder.step-drag', '{"initiatorIndex":1}'],
      ['text/plain', '{"initiatorIndex":1}'],
    ]);
  });

  it('deletes step on delete click', async () => {
    const onMergeSteps = jest.fn();
    const { getByLabelText } = render(
      <SeparatorActions
        canDelete={true}
        index={1}
        isDraggable={true}
        showControls={false}
        step={step}
      />,
      {
        contextOverrides: {
          steps: { onMergeSteps },
        },
      }
    );

    const deleteButton = getByLabelText('Delete step');

    fireEvent.click(deleteButton);

    expect(onMergeSteps).toHaveBeenCalledTimes(1);
  });

  it('allows user to edit step name', async () => {
    const value = 'test name for step';
    const stepIndex = 0;
    const setStepName = jest.fn();
    const { getByLabelText, getByRole } = render(
      <SeparatorActions
        canDelete={true}
        index={stepIndex}
        isDraggable={false}
        showControls={false}
        step={step}
      />,
      {
        contextOverrides: {
          steps: {
            setStepName,
          },
        },
      }
    );

    const editButton = getByLabelText('Rename step');

    fireEvent.click(editButton);

    const editField = getByRole('textbox');

    fireEvent.input(editField, { target: { value } });

    fireEvent.click(getByLabelText('Apply changes'));

    await waitFor(() => {
      expect(setStepName).toHaveBeenCalledTimes(1);
      expect(setStepName).toHaveBeenCalledWith(stepIndex, value);
    });
  });

  it('allows user to cancel an edit', async () => {
    const value = 'test name for step';
    const stepIndex = 0;
    const setStepName = jest.fn();
    const { getByLabelText, getByRole } = render(
      <SeparatorActions
        canDelete={true}
        index={stepIndex}
        isDraggable={false}
        showControls={false}
        step={step}
      />,
      {
        contextOverrides: {
          steps: {
            setStepName,
          },
        },
      }
    );

    const editButton = getByLabelText('Rename step');

    fireEvent.click(editButton);

    const editField = getByRole('textbox');

    fireEvent.input(editField, { target: { value } });

    fireEvent.click(getByLabelText('Cancel edit'));

    expect(setStepName).not.toHaveBeenCalled();
  });
});
