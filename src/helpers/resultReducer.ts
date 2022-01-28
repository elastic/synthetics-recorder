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

import type { JourneyType, TestEvent, Result } from "../common/types";

const initJourney = (type = "inline") => ({
  failed: 0,
  skipped: 0,
  succeeded: 0,
  journey: {
    status: "running",
    type: type as JourneyType,
    steps: [],
  },
});

/**
 * Use this function to incrementally build the result object for a test result
 * as the chunks are streamed from the backend.
 * @param state current result data
 * @param action update action
 * @returns new state
 */
export function resultReducer(
  state: Result | undefined,
  action: TestEvent
): Result | undefined {
  if (action.event === "journey/start") {
    return initJourney(action.data.name);
  }
  const nextResult = typeof state === "undefined" ? initJourney() : state;
  switch (action.event) {
    case "step/end": {
      nextResult[action.data.status]++;
      const steps = [...nextResult.journey.steps, { ...action.data }];
      const journey = {
        ...nextResult.journey,
        steps,
      };
      return {
        ...nextResult,
        journey,
      };
    }
    case "journey/end": {
      return {
        ...nextResult,
        journey: {
          ...nextResult.journey,
          status: action.data.status,
        },
      };
    }
    case "override": {
      return action.data;
    }
    default:
      return state;
  }
}
