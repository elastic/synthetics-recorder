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

import {
  render as rtlRender,
  RenderResult,
  RenderOptions,
} from "@testing-library/react";
import React from "react";
import {
  IRecordingContext,
  RecordingContext,
} from "../../contexts/RecordingContext";
import { IStepsContext, StepsContext } from "../../contexts/StepsContext";
import { IUrlContext, UrlContext } from "../../contexts/UrlContext";
import {
  RECORDING_CONTEXT_DEFAULTS,
  URL_CONTEXT_DEFAULTS,
  STEPS_CONTEXT_DEFAULTS,
} from "./defaults";
import { RenderContexts } from "./RenderContexts";

export function render<ComponentType>(
  component: React.ReactElement<ComponentType>,
  rtlRenderOptions?: Omit<RenderOptions, "queries">,
  options?: {
    contextOverrides?: {
      recording?: Partial<IRecordingContext>;
      steps?: Partial<IStepsContext>;
      url?: Partial<IUrlContext>;
    };
  }
): RenderResult {
  const contexts = [
    {
      defaults: RECORDING_CONTEXT_DEFAULTS,
      Context: RecordingContext,
      overrides: options?.contextOverrides?.recording,
    },
    {
      defaults: URL_CONTEXT_DEFAULTS,
      Context: UrlContext,
      overrides: options?.contextOverrides?.url,
    },
    {
      defaults: STEPS_CONTEXT_DEFAULTS,
      Context: StepsContext,
      overrides: options?.contextOverrides?.steps,
    },
  ];

  return rtlRender(
    <RenderContexts contexts={contexts}>{component}</RenderContexts>,
    rtlRenderOptions
  );
}
