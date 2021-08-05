const {
  JavaScriptLanguageGenerator,
} = require("playwright/lib/server/supplements/recorder/javascript");

class SyntheticsGenerator extends JavaScriptLanguageGenerator {
  constructor(isSuite) {
    super(true);
    this.isSuite = isSuite;
    this.insideStep = false;
    this.previousContext = undefined;
  }

  generateAction(actionInContext) {
    const { action, pageAlias } = actionInContext;
    const formatter = new JavaScriptFormatter(this.isSuite ? 2 : 0);

    if (action.name === "openPage") {
      return "";
    }
    // Check if its a new step
    const isNewStep = this.isNewStep(actionInContext);
    if (isNewStep) {
      if (this.insideStep) {
        formatter.add(this.generateStepEnd());
      }
      formatter.add(this.generateStepStart(actionTitle(action)));
    }

    const subject = actionInContext.isMainFrame
      ? pageAlias
      : actionInContext.frameName
      ? `${pageAlias}.frame(${formatObject({
          name: actionInContext.frameName,
        })})`
      : `${pageAlias}.frame(${formatObject({
          url: actionInContext.frameUrl,
        })})`;

    const signals = toSignalMap(action);

    if (signals.dialog) {
      formatter.add(`  ${pageAlias}.once('dialog', dialog => {
    console.log(\`Dialog message: $\{dialog.message()}\`);
    dialog.dismiss().catch(() => {});
  });`);
    }

    const emitPromiseAll =
      signals.waitForNavigation || signals.popup || signals.download;
    if (emitPromiseAll) {
      // Generate either await Promise.all([]) or
      // const [popup1] = await Promise.all([]).
      let leftHandSide = "";
      if (signals.popup)
        leftHandSide = `const [${signals.popup.popupAlias}] = `;
      else if (signals.download) leftHandSide = `const [download] = `;
      formatter.add(`${leftHandSide}await Promise.all([`);
    }

    // Popup signals.
    if (signals.popup) formatter.add(`${pageAlias}.waitForEvent('popup'),`);

    // Navigation signal.
    if (signals.waitForNavigation)
      formatter.add(
        `${pageAlias}.waitForNavigation(/*{ url: ${quote(
          signals.waitForNavigation.url
        )} }*/),`
      );

    // Download signals.
    if (signals.download)
      formatter.add(`${pageAlias}.waitForEvent('download'),`);

    const prefix =
      signals.popup || signals.waitForNavigation || signals.download
        ? ""
        : "await ";
    const actionCall = this._generateActionCall(action);

    // Dont cleanup page object managed by Synthetics
    if (actionCall === "close()" && pageAlias === "page") {
      return "";
    }
    const suffix = signals.waitForNavigation || emitPromiseAll ? "" : ";";
    formatter.add(`${prefix}${subject}.${actionCall}${suffix}`);

    if (emitPromiseAll) {
      formatter.add(`]);`);
    } else if (signals.assertNavigation) {
      formatter.add(
        `  expect(${pageAlias}.url()).toBe(${quote(
          signals.assertNavigation.url
        )});`
      );
    }
    this.previousContext = actionInContext;
    return formatter.format();
  }

  isNewStep(actionContext) {
    const { action, frameUrl } = actionContext;
    if (action.name === "navigate") {
      return true;
    } else if (action.name === "click") {
      return (
        this.previousContext?.frameUrl === frameUrl && action.signals.length > 0
      );
    }
    return false;
  }

  generateStepStart(name) {
    this.insideStep = true;
    return `step('${name}', async () => {`;
  }

  generateStepEnd() {
    if (!this.insideStep) {
      return "";
    }

    this.insideStep = false;
    const formatter = new JavaScriptFormatter(this.isSuite ? 2 : 0);
    formatter.add(`});`);
    formatter.newLine();
    return formatter.format();
  }

  generateHeader() {
    const formatter = new JavaScriptFormatter();
    formatter.add(`
      const { journey, step } = require('@elastic/synthetics');
      
      journey('Recorded journey', async ({ page, context }) => {`);
    return formatter.format();
  }

  generateFooter() {
    return `});`;
  }

  generateText(actions) {
    const text = [];
    if (this.isSuite) {
      text.push(this.generateHeader());
    }
    for (let i = 0; i < actions.length; i++) {
      text.push(this.generateAction(actions[i]));
      if (i === actions.length - 1) text.push(this.generateStepEnd());
    }
    if (this.isSuite) {
      text.push(this.generateFooter());
    }
    return text.join("\n");
  }
}

class JavaScriptFormatter {
  _baseIndent;
  _baseOffset;
  _lines = [];

  constructor(offset = 0) {
    this._baseIndent = " ".repeat(2);
    this._baseOffset = " ".repeat(offset);
  }

  prepend(text) {
    this._lines = text
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .concat(this._lines);
  }

  add(text) {
    this._lines.push(
      ...text
        .trim()
        .split("\n")
        .map((line) => line.trim())
    );
  }

  newLine() {
    this._lines.push("");
  }

  format() {
    let spaces = "";
    let previousLine = "";
    return this._lines
      .map((line) => {
        if (line === "") return line;
        if (line.startsWith("}") || line.startsWith("]"))
          spaces = spaces.substring(this._baseIndent.length);

        const extraSpaces = /^(for|while|if).*\(.*\)$/.test(previousLine)
          ? this._baseIndent
          : "";
        previousLine = line;

        line = spaces + extraSpaces + line;
        if (line.endsWith("{") || line.endsWith("["))
          spaces += this._baseIndent;
        return this._baseOffset + line;
      })
      .join("\n");
  }
}

function quote(text, char = "'") {
  if (char === "'") return char + text.replace(/[']/g, "\\'") + char;
  if (char === '"') return char + text.replace(/["]/g, '\\"') + char;
  if (char === "`") return char + text.replace(/[`]/g, "\\`") + char;
  throw new Error("Invalid escape char");
}

function toSignalMap(action) {
  let waitForNavigation;
  let assertNavigation;
  let popup;
  let download;
  let dialog;
  for (const signal of action.signals) {
    if (signal.name === "navigation" && signal.isAsync)
      waitForNavigation = signal;
    else if (signal.name === "navigation" && !signal.isAsync)
      assertNavigation = signal;
    else if (signal.name === "popup") popup = signal;
    else if (signal.name === "download") download = signal;
    else if (signal.name === "dialog") dialog = signal;
  }
  return {
    waitForNavigation,
    assertNavigation,
    popup,
    download,
    dialog,
  };
}

function formatObject(value, indent = "  ") {
  if (typeof value === "string") return quote(value);
  if (Array.isArray(value))
    return `[${value.map((o) => formatObject(o)).join(", ")}]`;
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    const tokens = [];
    for (const key of keys) tokens.push(`${key}: ${formatObject(value[key])}`);
    return `{\n${indent}${tokens.join(`,\n${indent}`)}\n}`;
  }
  return String(value);
}

function actionTitle(action) {
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
  }
}

module.exports = SyntheticsGenerator;
