import { Action, ActionContext } from "../common/types";

export function generateIR(actionContexts: ActionContext[]) {
  const result = [];
  const steps = [];
  for (const actionContext of actionContexts) {
    const { action, pageAlias, title } = actionContext;
    if (action.name === "openPage") {
      continue;
    } else if (action.name === "closePage" && pageAlias === "page") {
      continue;
    }

    // Add title to all actionContexts
    const enhancedContext = title
      ? actionContext
      : { ...actionContext, title: actionTitle(action) };
    steps.push(enhancedContext);
  }
  if (steps.length > 0) {
    result.push(steps);
  }
  return result;
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
export function generateMergedIR(
  prevAcs: ActionContext[][],
  currAcs: ActionContext[][]
): ActionContext[][] {
  const prevActionContexts = prevAcs.flat();
  const currActionContexts = currAcs.flat();
  const prevLength = prevActionContexts.length;
  const currLength = currActionContexts.length;
  /**
   * when recorder is started/resetted
   */
  if (currLength === 0 || prevLength === 0) {
    return currAcs;
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
