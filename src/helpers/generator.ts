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

import { Action, ActionContext, Step, Steps } from "../common/types";

export function generateIR(actionContexts: Step) {
  const result = [];
  let steps = [];
  let previousContext = null;
  let newStep = false;
  for (const actionContext of actionContexts) {
    const { action, pageAlias, title } = actionContext;
    if (action.name === "openPage") {
      continue;
    } else if (action.name === "closePage" && pageAlias === "page") {
      continue;
    }

    newStep = isNewStep(actionContext, previousContext);
    if (newStep && steps.length > 0) {
      result.push(steps);
      steps = [];
    }
    // Add title to all actionContexts
    const enhancedContext = title
      ? actionContext
      : { ...actionContext, title: actionTitle(action) };
    steps.push(enhancedContext);
    previousContext = actionContext;
  }
  if (steps.length > 0) {
    result.push(steps);
  }
  return result;
}

function isNewStep(
  actionContext: ActionContext,
  previousContext: ActionContext | null
) {
  const { action, frameUrl } = actionContext;

  if (action.name === "navigate") {
    return true;
  } else if (action.name === "click") {
    return previousContext?.frameUrl === frameUrl && action.signals.length > 0;
  }
  return false;
}

export function actionTitle(action: Action) {
  switch (action.name) {
    case "openPage":
      return `Open new page`;
    case "closePage":
      return `Close page`;
    case "check":
      return `Check ${action.selector}`;
    case "uncheck":
      return `Uncheck ${action.selector}`;
    case "click": {
      if (action.clickCount === 1) return `Click ${action.selector}`;
      if (action.clickCount === 2) return `Double click ${action.selector}`;
      if (action.clickCount === 3) return `Triple click ${action.selector}`;
      return `${action.clickCount}× click`;
    }
    case "fill":
      return `Fill ${action.selector}`;
    case "setInputFiles":
      if (action.files?.length === 0) return `Clear selected files`;
      else return `Upload ${action.files?.join(", ")}`;
    case "navigate":
      return `Go to ${action.url}`;
    case "press":
      return (
        `Press ${action.key}` + (action.modifiers ? " with modifiers" : "")
      );
    case "select":
      return `Select ${action.options?.join(", ")}`;
    case "assert":
      return `Assert`;
  }
}

/**
 * Works by taking the actions from the PW recorder and
 * the actions generated/modified by the UI and merges them
 * to display the correct modified actions on the UI
 */
export function generateMergedIR(prevSteps: Steps, currSteps: Steps): Steps {
  const prevActionContexts = prevSteps.flat();
  const currActionContexts = currSteps.flat();
  const prevLength = prevActionContexts.length;
  const currLength = currActionContexts.length;
  /**
   * when recorder is started/resetted
   */
  if (currLength === 0 || prevLength === 0) {
    return currSteps;
  }

  const mergedActions = [];
  const maxLen = Math.max(prevLength, currLength);
  for (let i = 0, j = 0; i < maxLen || j < maxLen; i++, j++) {
    /**
     * Keep adding all the assertions added by user as PW
     * does not have any assertion built in
     * We treat the UI as the source of truth
     */
    if (prevActionContexts[i]?.action.name === "assert") {
      do {
        mergedActions.push(prevActionContexts[i]);
        i++;
      } while (i < maxLen && prevActionContexts[i]?.action.name === "assert");
    }
    /**
     * If actions are not assert commands, then we need to
     * check if the actions are modified on the UI and add
     * them to the final list
     *
     * Any modified state in the UI is the final state
     */
    const item = prevActionContexts[i]?.modified
      ? prevActionContexts[i]
      : currActionContexts[j];
    item && mergedActions.push(item);
  }
  return generateIR(mergedActions);
}
