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

import { Action, /* ActionInContext, */ Signal } from '@elastic/synthetics';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore unit tests won't run without this ignore because there is no type declaration for `PlaywrightGenerator`
import * as PlaywrightGenerator from 'playwright/lib/server/recorder/javascript';
import { RecorderSteps, ActionInContext } from '../common/types';

function toAssertCall(pageAlias: string, action: Action) {
  const { command, selector, value } = action;
  switch (command) {
    case 'textContent':
    case 'innerText':
      return `expect(await ${pageAlias}.${command}(${quote(selector ?? '')})).toMatch(${quote(
        value ?? ''
      )});`;
    case 'isVisible':
    case 'isHidden':
    case 'isChecked':
    case 'isEditable':
    case 'isEnabled':
    case 'isDisabled':
      return `expect(await ${pageAlias}.${command}(${quote(selector ?? '')})).toBeTruthy();`;
  }
}

function toSignalMap(action: Action) {
  let waitForNavigation: Signal | undefined;
  let assertNavigation: Signal | undefined;
  let popup: Signal | undefined;
  let download: Signal | undefined;
  let dialog: Signal | undefined;
  for (const signal of action.signals) {
    if (signal.name === 'navigation' && signal.isAsync) waitForNavigation = signal;
    else if (signal.name === 'navigation' && !signal.isAsync) assertNavigation = signal;
    else if (signal.name === 'popup') popup = signal;
    else if (signal.name === 'download') download = signal;
    else if (signal.name === 'dialog') dialog = signal;
  }
  return {
    waitForNavigation,
    assertNavigation,
    popup,
    download,
    dialog,
  };
}

export function quote(text: string, char = "'"): string {
  const stringified = JSON.stringify(text);
  const escapedText = stringified.substring(1, stringified.length - 1).replace(/\\"/g, '"');
  if (char === "'") return char + escapedText.replace(/[']/g, "\\'") + char;
  if (char === '"') return char + escapedText.replace(/["]/g, '\\"') + char;
  if (char === '`') return char + escapedText.replace(/[`]/g, '`') + char;
  throw new Error('Invalid escape char');
}

type Formattable = string | string[] | Record<string, unknown>;

function isFormattable(value: unknown): value is Formattable {
  return (
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(v => typeof v === 'string')) ||
    typeof value === 'object'
  );
}

function formatObject(value: Formattable, indent = '  '): string {
  if (typeof value === 'string') return quote(value);
  if (Array.isArray(value)) return `[${value.map(o => formatObject(o)).join(', ')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    const tokens: string[] = [];
    for (const key of keys) {
      const child = value[key];
      if (child === undefined || !isFormattable(child)) continue;
      tokens.push(`${key}: ${formatObject(child)}`);
    }
    return `{\n${indent}${tokens.join(`,\n${indent}`)}\n}`;
  }
  return String(value);
}

/**
 * Generates an appropriate title string based on the action type/data.
 * @param action Playwright action IR
 * @returns title string
 */
export function actionTitle(action: Action) {
  switch (action.name) {
    case 'openPage':
      return `Open new page`;
    case 'closePage':
      return `Close page`;
    case 'check':
      return `Check ${action.selector}`;
    case 'uncheck':
      return `Uncheck ${action.selector}`;
    case 'click': {
      if (action.clickCount === 1) return `Click ${action.selector}`;
      if (action.clickCount === 2) return `Double click ${action.selector}`;
      if (action.clickCount === 3) return `Triple click ${action.selector}`;
      return `${action.clickCount}× click`;
    }
    case 'fill':
      return `Fill ${action.selector}`;
    case 'setInputFiles':
      if (action.files?.length === 0) return `Clear selected files`;
      else return `Upload ${action.files?.join(', ')}`;
    case 'navigate':
      return `Go to ${action.url}`;
    case 'press':
      return `Press ${action.key}` + (action.modifiers ? ' with modifiers' : '');
    case 'select':
      return `Select ${action.options?.join(', ')}`;
    case 'assert':
      return `Assert ${action.selector} ${action.command}`;
  }
}

export class SyntheticsGenerator extends PlaywrightGenerator.JavaScriptLanguageGenerator {
  private previousContext?: ActionInContext;
  private insideStep: boolean;
  private varsToHoist: string[];

  constructor(private isProject: boolean) {
    super(true);
    this.insideStep = false;
    this.previousContext = undefined;
    this.varsToHoist = [];
  }

  /**
   * Generate code for an action.
   * @param actionInContext The action to create code for.
   * @returns the strings generated for the action.
   */
  generateAction(actionInContext: ActionInContext) {
    const { action, frame } = actionInContext;
    const { pageAlias } = frame;
    if (action.name === 'openPage') {
      return '';
    }
    // Don't cleanup page object managed by Synthetics
    const isCleanUp = action.name === 'closePage' && pageAlias === 'page';
    if (isCleanUp) {
      return '';
    }

    const stepIndent = this.insideStep ? 2 : 0;
    const offset = this.isProject ? 2 + stepIndent : 0 + stepIndent;
    const formatter = new PlaywrightGenerator.JavaScriptFormatter(offset);

    const subject = frame.isMainFrame
      ? pageAlias
      : frame.name
      ? `${pageAlias}.frame(${formatObject({
          name: frame.name,
        })})`
      : `${pageAlias}.frame(${formatObject({
          url: frame.url,
        })})`;

    const signals = toSignalMap(action);

    if (signals.dialog) {
      formatter.add(`  ${pageAlias}.once('dialog', dialog => {
    console.log(\`Dialog message: $\{dialog.message()}\`);
    dialog.dismiss().catch(() => {});
  });`);
    }

    const emitPromiseAll = signals.waitForNavigation || signals.popup || signals.download;
    if (emitPromiseAll) {
      const isVarHoisted = signals.popup?.popupAlias && this.isVarHoisted(signals.popup.popupAlias);
      // Generate either await Promise.all([]) or
      // const [popup1] = await Promise.all([]).
      let leftHandSide = '';
      if (signals.popup && signals.popup.popupAlias && !isVarHoisted) {
        leftHandSide = `const [${signals.popup.popupAlias}] = `;
      } else if (isVarHoisted) {
        leftHandSide = `[${signals.popup?.popupAlias}] = `;
      } else if (signals.download) {
        leftHandSide = `const [download] = `;
      }
      formatter.add(`${leftHandSide}await Promise.all([`);
    }

    // Popup signals.
    if (signals.popup) formatter.add(`${pageAlias}.waitForEvent('popup'),`);

    // Navigation signal.
    if (signals.waitForNavigation) formatter.add(`${pageAlias}.waitForNavigation(),`);

    // Download signals.
    if (signals.download) formatter.add(`${pageAlias}.waitForEvent('download'),`);

    const prefix = signals.popup || signals.waitForNavigation || signals.download ? '' : 'await ';
    const actionCall = super._generateActionCall(action);
    // Add assertion from Synthetics.
    const isAssert = action.name === 'assert' && action.isAssert;

    if (!isAssert) {
      const suffix = signals.waitForNavigation || emitPromiseAll ? '' : ';';
      formatter.add(`${prefix}${subject}.${actionCall}${suffix}`);

      if (emitPromiseAll) {
        formatter.add(']);');
      } else if (signals.assertNavigation) {
        formatter.add(
          `  expect(${pageAlias}.url()).toBe(${quote(signals.assertNavigation.url ?? '')});`
        );
      }
    } else if (action.command) {
      formatter.add(toAssertCall(pageAlias, action));
    }

    this.previousContext = actionInContext;
    return formatter.format();
  }

  isNewStep(actioninContext: ActionInContext) {
    const { action, frame } = actioninContext;
    if (action.name === 'navigate') {
      return true;
    } else if (action.name === 'click') {
      return this.previousContext?.frame.url === frame.url && action.signals.length > 0;
    }
    return false;
  }

  generateStepStart(name: string) {
    this.insideStep = true;
    const formatter = new PlaywrightGenerator.JavaScriptFormatter(this.getDefaultOffset());
    formatter.add(`step(${quote(name)}, async () => {`);
    return formatter.format();
  }

  generateStepEnd() {
    if (!this.insideStep) {
      return '';
    }
    this.insideStep = false;
    const formatter = new PlaywrightGenerator.JavaScriptFormatter(this.getDefaultOffset());
    formatter.add(`});`);
    return formatter.format();
  }

  generateHeader() {
    const formatter = new PlaywrightGenerator.JavaScriptFormatter(0);
    formatter.add(`
      const { journey, step, expect } = require('@elastic/synthetics');

      journey('Recorded journey', async ({ page, context }) => {`);
    return formatter.format();
  }

  generateFooter() {
    return `});`;
  }

  /**
   * Generates JavaScript code from a custom set of steps and nested actions.
   *
   * This function makes no assumptions about where steps should be created,
   * and instead follows the step definitions the caller has defined.
   * @param steps IR to use for code generation
   * @returns a list of the code strings outputted by the generator
   */
  generateFromSteps(steps: RecorderSteps): string {
    const text: string[] = [];
    if (this.isProject) {
      text.push(this.generateHeader());
    }
    this.varsToHoist = this.findVarsToHoist(steps);
    text.push(this.generateHoistedVars());
    for (const step of steps) {
      if (step.actions.length === 0) throw Error('Cannot process an empty step');
      const name = step.name ?? step.actions[0].title ?? actionTitle(step.actions[0].action);
      text.push(this.generateStepStart(name ?? ''));

      for (const action of step.actions) {
        const actionText = this.generateAction(action);
        if (actionText.length) text.push(actionText);
      }

      text.push(this.generateStepEnd());
    }
    if (this.isProject) {
      text.push(this.generateFooter());
    }

    return text.filter(s => !!s).join('\n');
  }

  generateHoistedVars() {
    const formatter = new PlaywrightGenerator.JavaScriptFormatter(this.getDefaultOffset());
    for (const varName of this.varsToHoist) {
      formatter.add(`let ${varName};`);
    }
    return formatter.format();
  }

  isVarHoisted(varName: string) {
    return this.varsToHoist.indexOf(varName) >= 0;
  }

  getDefaultOffset() {
    return this.isProject ? 2 : 0;
  }

  /**
   * We need to hoist any page or popup alias that appears in more than one step.
   * @param steps the step IR to evaluate
   * @returns an array that contains the names of all variables that need to be hoisted
   */
  findVarsToHoist(steps: RecorderSteps): string[] {
    const aliasSet = new Set<string>();
    for (const step of steps) {
      for (const actionContext of step.actions) {
        actionContext.action.signals
          .filter(({ name, popupAlias }) => name === 'popup' && popupAlias)
          .forEach(({ popupAlias }) => aliasSet.add(popupAlias as string));
        aliasSet.add(actionContext.frame.pageAlias);
      }
    }
    return Array.from(aliasSet).filter(alias => alias !== 'page');
  }
}
