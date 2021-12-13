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

import { useCallback, useContext, useState } from "react";
import { getCodeForResult, getCodeFromActions } from "../common/shared";
import { CommunicationContext } from "../contexts/CommunicationContext";
import { Result, Steps } from "../common/types";

export function useSyntheticsTest(actions: Steps) {
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [codeBlocks, setCodeBlocks] = useState("");
  const { ipc } = useContext(CommunicationContext);

  const onTest = useCallback(
    async function () {
      /**
       * For the time being we are only running tests as inline.
       */
      const code = await getCodeFromActions(ipc, actions, "inline");
      const resultFromServer: Result = await ipc.callMain("run-journey", {
        code,
        isSuite: false,
      });

      setCodeBlocks(await getCodeForResult(ipc, actions, result?.journey));
      setResult(resultFromServer);
    },
    [actions, ipc, result]
  );
  return {
    codeBlocks,
    result,
    onTest,
    setCodeBlocks,
    setResult,
  };
}
