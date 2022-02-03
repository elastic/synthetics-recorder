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

import type { TestEvent, Result, JourneyType } from "../common/types";

/**
 * Use this function to incrementally build the result object for a test result
 * as the chunks are streamed from the backend.
 * @param state current result data
 * @param action update action
 * @returns new state
 */
export function resultReducer(
  state: Result | undefined = {
    failed: 0,
    skipped: 0,
    succeeded: 0,
    journey: {
      status: "running",
      type: "inline",
      steps: [],
    },
  },
  action: TestEvent
): Result | undefined {
  switch (action.event) {
    case "step/end": {
      const nextState: Result = {
        ...state,
        journey: {
          ...state.journey,
          steps: [...state.journey.steps, action.data],
        },
      };
      nextState[action.data.status] += 1;
      return nextState;
    }
    case "journey/end": {
      return {
        ...state,
        journey: {
          ...state.journey,
          status: action.data.status,
        },
      };
    }
    case "journey/start": {
      return {
        ...state,
        journey: {
          ...state.journey,
          type: action.data.name as JourneyType,
        },
      };
    }
    case "override": {
      return action.data;
    }
  }
}
