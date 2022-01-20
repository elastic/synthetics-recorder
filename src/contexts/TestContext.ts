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
import { createContext } from "react";
import { Result, Setter } from "../common/types";

function notImplemented() {
  throw Error("Test context not initialized");
}

async function notImplementedAsync() {
  notImplemented();
}

interface ITestContext {
  codeBlocks: string;
  isResultFlyoutVisible: boolean;
  onTest: () => Promise<void>;
  result?: Result;
  setCodeBlocks: Setter<string>;
  setResult: Setter<Result | undefined>;
  setIsResultFlyoutVisible: Setter<boolean>;
}

export const TestContext = createContext<ITestContext>({
  codeBlocks: "",
  isResultFlyoutVisible: false,
  onTest: notImplementedAsync,
  setCodeBlocks: notImplemented,
  setResult: notImplemented,
  setIsResultFlyoutVisible: notImplemented,
});
