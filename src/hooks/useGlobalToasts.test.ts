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

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useGlobalToasts } from './useGlobalToasts';

describe('useGlobalToasts', () => {
  it('should add a toast', () => {
    const { result } = renderHook(() => useGlobalToasts());
    act(() => {
      result.current.sendToast({ id: '1', title: 'Test Toast' });
    });
    expect(result.current.toasts).toEqual([{ id: '1', title: 'Test Toast' }]);
  });

  it('should dismiss a toast', () => {
    const { result } = renderHook(() => useGlobalToasts());
    act(() => {
      result.current.sendToast({ id: '1', title: 'Test Toast' });
    });
    expect(result.current.toasts).toEqual([{ id: '1', title: 'Test Toast' }]);
    act(() => {
      result.current.dismissToast({ id: '1', title: 'Test Toast' });
    });
    expect(result.current.toasts).toEqual([]);
  });

  it('should set toastLifeTimeMs', () => {
    const { result } = renderHook(() => useGlobalToasts());
    act(() => {
      result.current.setToastLifeTimeMs(10000);
    });
    expect(result.current.toastLifeTimeMs).toEqual(10000);
  });
});
