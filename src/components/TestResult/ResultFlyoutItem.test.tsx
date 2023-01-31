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
import { cleanup } from '@testing-library/react';
import { ResultFlyoutItem } from './ResultFlyoutItem';
import { render } from '../../helpers/test';
import type { JourneyStep } from '../../../common/types';

afterEach(cleanup);

const step: JourneyStep = {
  actionTitles: ['Action 1', 'Action 2'],
  duration: 5000,
  name: 'Test step',
  status: 'succeeded',
};

describe('ResultFlyoutItem', () => {
  it('should render title with step number and truncated step name', () => {
    const { getByText } = render(<ResultFlyoutItem code="" step={step} stepIndex={1} />);
    expect(getByText(`2: Test step`));
  });

  it('should render duration element if step is not skipped', () => {
    const { getByText } = render(<ResultFlyoutItem code="" step={step} stepIndex={1} />);
    expect(getByText('5s'));
  });

  it('should render ResultBody component if step has no error', () => {
    const { getByText } = render(<ResultFlyoutItem code="" step={step} stepIndex={1} />);
    expect(getByText('Action 1'));
    expect(getByText('Action 2'));
  });

  it('should render ResultErrorBody component if step has error', () => {
    step.error = new Error('Test error');
    const { getByText } = render(<ResultFlyoutItem code="" step={step} stepIndex={1} />);
    expect(getByText('Test error'));
  });

  it('does not render ResultTitle if action status is skipped', () => {
    step.status = 'skipped';
    const { queryByText } = render(<ResultFlyoutItem code="" step={step} stepIndex={1} />);
    expect(queryByText('5s')).toBeNull();
  });
});
