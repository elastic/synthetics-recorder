export function generateIR(actionContexts) {
  const result = [];
  for (const actionContext of actionContexts) {
    const { action, pageAlias } = actionContext;
    if (action.name === "openPage") {
      continue;
    } else if (action.name === "closePage" && pageAlias === "page") {
      continue;
    }
    result.push(actionContext);
  }
  return result;
}
