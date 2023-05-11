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

import type { Steps } from '@elastic/synthetics';
import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createAction, createSteps } from '../../../common/helper/test/createAction';
import { render } from '../../helpers/test';
import { ActionElement } from './ActionElement';

describe('ActionElement', () => {
  let onDeleteAction: jest.Mock;
  let onUpdateAction: jest.Mock;
  let onSetActionIsOpen: jest.Mock;
  let steps: Steps;

  beforeEach(() => {
    onDeleteAction = jest.fn();
    onUpdateAction = jest.fn();
    onSetActionIsOpen = jest.fn();
    steps = createSteps([['action1', 'action2'], ['action3'], ['action4', 'action5']]);
  });

  it('renders typical content as expected', () => {
    const action = createAction('action-1', { title: 'Action 1' });
    const { getByText } = render(
      <ActionElement actionIndex={0} actionContext={action} stepIndex={0} />,
      {
        contextOverrides: {
          steps: {
            onDeleteAction,
            onUpdateAction,
            onSetActionIsOpen,
            steps,
          },
        },
      }
    );
    expect(getByText('action-1'));
  });

  it('renders null if the action is soft-deleted', () => {
    const action = createAction('action-1', { title: 'Action 1', isSoftDeleted: true });
    const { queryByText } = render(
      <ActionElement actionIndex={0} actionContext={action} stepIndex={0} />,
      {
        contextOverrides: {
          steps: {
            onDeleteAction,
            onUpdateAction,
            onSetActionIsOpen,
            steps,
          },
        },
      }
    );
    expect(queryByText('action-1')).toBeNull();
  });

  it('renders assertion component when that flag is set', async () => {
    const action = createAction('action-1', {
      title: 'Action 1',
      action: { isAssert: true },
      isOpen: true,
    });
    const { getByText, getByLabelText } = render(
      <ActionElement actionIndex={0} actionContext={action} stepIndex={0} />,
      {
        contextOverrides: {
          steps: {
            onDeleteAction,
            onUpdateAction,
            onSetActionIsOpen,
            steps,
          },
        },
      }
    );
    expect(getByLabelText('Assertion value'));

    const saveButton = getByText('Save');

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onUpdateAction).toHaveBeenCalledTimes(1);
      expect(onUpdateAction).toHaveBeenCalledWith(
        {
          action: {
            command: '',
            isAssert: true,
            name: 'action-1',
            selector: undefined,
            signals: [],
            url: 'https://www.elastic.co',
            value: '',
          },
          frame: {
            committed: true,
            isMainFrame: true,
            pageAlias: 'page',
            url: 'https://www.elastic.co',
          },
          frameUrl: 'https://frame.url',
          isMainFrame: true,
          isOpen: false,
          pageAlias: 'alias',
          title: 'Action 1',
        },
        0,
        0
      );
    });
  });

  it('renders action component when for non-assert', async () => {
    const action = createAction('action-1', {
      title: 'Action 1',
      isOpen: true,
    });
    const { getByText } = render(
      <ActionElement actionIndex={1} actionContext={action} stepIndex={1} />,
      {
        contextOverrides: {
          steps: {
            onDeleteAction,
            onUpdateAction,
            onSetActionIsOpen,
            steps,
          },
        },
      }
    );

    expect(getByText('Edit action'));

    const saveButton = getByText('Save');

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onUpdateAction).toHaveBeenCalledTimes(1);
      expect(onUpdateAction).toHaveBeenCalledWith(
        {
          action: {
            name: 'action-1',
            selector: '',
            signals: [],
            text: undefined,
            url: 'https://www.elastic.co',
          },
          frame: {
            committed: true,
            isMainFrame: true,
            pageAlias: 'page',
            url: 'https://www.elastic.co',
          },
          frameUrl: 'https://frame.url',
          isMainFrame: true,
          isOpen: false,
          modified: true,
          pageAlias: 'alias',
          title: 'Action 1',
        },
        1,
        1
      );
    });
  });

  it('shows controls on mouse over and hides them on mouse leave', async () => {
    const hiddenStyle = '"visibility":"hidden"';
    const action = createAction('action-1', {
      title: 'action-1',
      isOpen: true,
    });
    const { getByLabelText, getByTestId } = render(
      <ActionElement actionIndex={1} actionContext={action} stepIndex={1} />,
      {
        contextOverrides: {
          steps: {
            onDeleteAction,
            onUpdateAction,
            onSetActionIsOpen,
            steps,
          },
        },
      }
    );

    expect(JSON.stringify(getByLabelText('Begin editing this action').style)).toContain(
      hiddenStyle
    );

    const accordion = getByTestId('step-accordion-action-1');

    fireEvent.mouseOver(accordion);

    await waitFor(() => {
      expect(JSON.stringify(getByLabelText('Begin editing this action').style)).not.toContain(
        hiddenStyle
      );
    });

    fireEvent.mouseLeave(accordion);

    await waitFor(() => {
      expect(JSON.stringify(getByLabelText('Begin editing this action').style)).toContain(
        hiddenStyle
      );
    });
  });

  it('sets action open status via controls', async () => {
    const actionIndex = 1;
    const stepIndex = 1;
    const action = createAction('action-1', {
      title: 'action-1',
      isOpen: true,
    });
    const { getByText, getByTestId } = render(
      <ActionElement actionIndex={actionIndex} actionContext={action} stepIndex={stepIndex} />,
      {
        contextOverrides: {
          steps: {
            onDeleteAction,
            onUpdateAction,
            onSetActionIsOpen,
            steps,
          },
        },
      }
    );

    const accordion = getByTestId('step-accordion-action-1');

    fireEvent.mouseOver(accordion);

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(onSetActionIsOpen).toHaveBeenCalledWith(stepIndex, actionIndex, false);
    });
  });
});
