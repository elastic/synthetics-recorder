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
import { fireEvent } from '@testing-library/react';
import { createAction } from '../../../common/helper/test/createAction';
import { render } from '../../helpers/test';
import { ActionDetail } from './ActionDetail';
import { ActionContext } from '../../../common/types';

describe('<ActionDetail />', () => {
  let onUpdateActionMock: jest.Mock;

  beforeEach(() => {
    onUpdateActionMock = jest.fn(updatedAction => {
      return updatedAction;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('navigate', () => {
    const url = 'https://example.com';
    let navigateAction: ActionContext;
    beforeEach(() => {
      navigateAction = createAction('navigate', { action: { url } });
    });

    it('has url input', () => {
      const { getByLabelText } = render(
        <ActionDetail actionContext={navigateAction} actionIndex={0} stepIndex={0} />
      );
      const input = getByLabelText(/navigate/i);
      expect(input).toBeTruthy();
      expect(input.getAttribute('value')).toEqual(url);
    });

    it('updates url', () => {
      const { getByLabelText, getByRole } = render(
        <ActionDetail actionContext={navigateAction} actionIndex={0} stepIndex={0} />,
        { contextOverrides: { steps: { onUpdateAction: onUpdateActionMock } } }
      );
      const input = getByLabelText(/navigate/i);
      const newUrl = 'https://elastic.co';
      fireEvent.change(input, { target: { value: newUrl } });
      const button = getByRole('button', { name: /save/i });
      fireEvent.click(button);

      expect(onUpdateActionMock).toHaveBeenCalled();
      const { action } = onUpdateActionMock.mock.results[0].value;
      expect(action.url).toEqual(newUrl);
    });
  });

  describe('click', () => {
    let clickAction: ActionContext;
    beforeEach(() => {
      clickAction = createAction('click', { action: { selector: '#elem-id', url: '' } });
    });

    it('has selector value in input', () => {
      const { getByLabelText } = render(
        <ActionDetail actionContext={clickAction} actionIndex={0} stepIndex={0} />
      );
      const input = getByLabelText(/click/i);
      expect(input).toBeTruthy();
      expect(input.getAttribute('value')).toEqual('#elem-id');
    });

    it('updates selector', () => {
      const { getByLabelText, getByRole } = render(
        <ActionDetail actionContext={clickAction} actionIndex={0} stepIndex={0} />,
        {
          contextOverrides: { steps: { onUpdateAction: onUpdateActionMock } },
        }
      );
      const input = getByLabelText(/click/i);

      fireEvent.change(input, { target: { value: '#new-elem-id' } });
      const button = getByRole('button', { name: /save/i });
      fireEvent.click(button);
      expect(onUpdateActionMock).toHaveBeenCalled();
      const { action } = onUpdateActionMock.mock.results[0].value;
      expect(action.selector).toEqual('#new-elem-id');
    });
  });

  describe('fill', () => {
    let fillAction: ActionContext;
    beforeEach(() => {
      fillAction = createAction('fill', {
        action: { selector: '#elem-id', url: '', text: 'Hello world' },
      });
    });

    it('has two input fields', () => {
      const { getByLabelText } = render(
        <ActionDetail actionContext={fillAction} actionIndex={0} stepIndex={0} />
      );
      const input1 = getByLabelText(/fill/i);
      expect(input1).toBeTruthy();
      expect(input1.getAttribute('value')).toEqual('#elem-id');

      const input2 = getByLabelText(/Value/i);
      expect(input2).toBeTruthy();
      expect(input2.getAttribute('value')).toEqual('Hello world');
    });

    it('updates selector and fill value', () => {
      const { getByLabelText, getByRole } = render(
        <ActionDetail actionContext={fillAction} actionIndex={0} stepIndex={0} />,
        {
          contextOverrides: { steps: { onUpdateAction: onUpdateActionMock } },
        }
      );
      const selectorInput = getByLabelText(/fill/i);
      fireEvent.change(selectorInput, { target: { value: '#new-elem-id' } });

      const valueInput = getByLabelText(/value/i);
      fireEvent.change(valueInput, { target: { value: 'Elastic' } });
      const button = getByRole('button', { name: /save/i });
      fireEvent.click(button);

      expect(onUpdateActionMock).toHaveBeenCalled();
      const { action } = onUpdateActionMock.mock.results[0].value;
      expect(action.selector).toEqual('#new-elem-id');
      expect(action.text).toEqual('Elastic');
    });
  });
});
