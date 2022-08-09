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
import { fireEvent, getByRole } from '@testing-library/react';
import React from 'react';
import { createAction } from '../../../common/helper/test/createAction';
import { ActionContext } from '../../../common/types';
import { render } from '../../helpers/test';
import { ActionDetail } from './ActionDetail';

describe.only('<ActionDetail />', () => {
  describe('navigate', () => {
    const url = 'https://example.com';
    const navigateAction = createAction('navigate', { action: { url } });

    it('has url input', () => {
      const { getByLabelText } = render(
        <ActionDetail actionContext={navigateAction} actionIndex={0} stepIndex={0} />
      );
      const input = getByLabelText(/navigate/i);
      expect(input).toBeTruthy();
      expect(input.getAttribute('value')).toEqual(url);
    });

    it('updates input', () => {
      const { getByLabelText, getByRole } = render(
        <ActionDetail actionContext={navigateAction} actionIndex={0} stepIndex={0} />
      );
      const input = getByLabelText(/navigate/i);

      fireEvent.change(input, { target: { value: 'https://elastic.co' } });
      const button = getByRole('button', { name: /save/i });
      fireEvent.click(button);
    });
  });
});
