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

import { render as rtlRender, RenderResult, RenderOptions } from '@testing-library/react';
import React from 'react';
import { CommunicationContext, ICommunicationContext } from '../../contexts/CommunicationContext';
import { IRecordingContext, RecordingContext } from '../../contexts/RecordingContext';
import { IStepsContext, StepsContext } from '../../contexts/StepsContext';
import { StyledComponentsEuiProvider } from '../../contexts/StyledComponentsEuiProvider';
import { IUrlContext, UrlContext } from '../../contexts/UrlContext';
import {
  getRecordingContextDefaults,
  getUrlContextDefaults,
  getStepsContextDefaults,
  getCommunicationContextDefaults,
} from './defaults';
import { RenderContexts } from './RenderContexts';

export function render<ComponentType>(
  component: React.ReactElement<ComponentType>,
  options?: {
    renderOptions?: Omit<RenderOptions, 'queries'>;
    contextOverrides?: {
      communication?: Partial<ICommunicationContext>;
      recording?: Partial<IRecordingContext>;
      steps?: Partial<IStepsContext>;
      url?: Partial<IUrlContext>;
    };
  }
): RenderResult {
  const contexts = [
    {
      defaults: getRecordingContextDefaults(),
      Context: RecordingContext,
      overrides: options?.contextOverrides?.recording,
    },
    {
      defaults: getUrlContextDefaults(),
      Context: UrlContext,
      overrides: options?.contextOverrides?.url,
    },
    {
      defaults: getStepsContextDefaults(),
      Context: StepsContext,
      overrides: options?.contextOverrides?.steps,
    },
    {
      defaults: getCommunicationContextDefaults(),
      Context: CommunicationContext,
      overrides: options?.contextOverrides?.communication,
    },
  ];

  return rtlRender(
    <StyledComponentsEuiProvider>
      <RenderContexts contexts={contexts}>{component}</RenderContexts>
    </StyledComponentsEuiProvider>,
    options?.renderOptions
  );
}
