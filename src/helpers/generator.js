export function generateIR(actionContexts) {
  const result = [];
  let steps = [];
  let previousContext = null;
  let newStep = false;
  for (const actionContext of actionContexts) {
    const { action, pageAlias } = actionContext;
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
    const enhancedContext = {
      ...actionContext,
      title: actionTitle(actionContext.action),
    };
    steps.push(enhancedContext);
    previousContext = actionContext;
  }
  if (steps.length > 0) {
    result.push(steps);
  }
  return result;
}

function isNewStep(actionContext, previousContext) {
  const { action, frameUrl } = actionContext;

  if (action.name === "navigate") {
    return true;
  } else if (action.name === "click") {
    return previousContext?.frameUrl === frameUrl && action.signals.length > 0;
  }
  return false;
}

export function actionTitle(action) {
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
      if (action.files.length === 0) return `Clear selected files`;
      else return `Upload ${action.files.join(", ")}`;
    case "navigate":
      return `Go to ${action.url}`;
    case "press":
      return (
        `Press ${action.key}` + (action.modifiers ? " with modifiers" : "")
      );
    case "select":
      return `Select ${action.options.join(", ")}`;
    case "assert":
      return `Assert`;
  }
}
