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

import { EuiFlyout } from "@elastic/eui";
import React, { useEffect, useState } from "react";
import { getCodeFromActions } from "../../common/shared";
import type { JourneyType, Setter, Steps } from "../../common/types";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface IExportScriptFlyout {
  setVisible: Setter<boolean>;
  steps: Steps;
}

const FLYOUT_ID = "export-script-flyout-title";

export function ExportScriptFlyout({ setVisible, steps }: IExportScriptFlyout) {
  const [code, setCode] = useState("");
  const [exportAsSuite, setExportAsSuite] = useState(false);

  const type: JourneyType = exportAsSuite ? "suite" : "inline";

  useEffect(() => {
    (async function getCode() {
      const codeFromActions = await getCodeFromActions(steps, type);
      setCode(codeFromActions);
    })();
  }, [steps, setCode, type]);

  return (
    <EuiFlyout aria-labelledby={FLYOUT_ID} onClose={() => setVisible(false)}>
      <Header headerText="Journey code" id={FLYOUT_ID} />
      <Body
        code={code}
        exportAsSuite={exportAsSuite}
        setExportAsSuite={setExportAsSuite}
      />
      <Footer setVisible={setVisible} type={type} />
    </EuiFlyout>
  );
}
