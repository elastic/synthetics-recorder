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

import React, { useContext, useEffect, useState } from "react";
import {
  EuiCodeBlock,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiTitle,
} from "@elastic/eui";
import { getCodeFromActions } from "../common/shared";
import { Steps } from "./Steps";
import { StepsContext } from "../contexts/StepsContext";
import type { ActionContext, JourneyType, Setter } from "../common/types";
import { CommunicationContext } from "../contexts/CommunicationContext";

interface IRecordedCodeTabs {
  selectedTab: JourneyType;
  setSelectedTab: Setter<JourneyType>;
}

interface RecordedCodeTab {
  id: JourneyType;
  name: "Inline" | "Suite";
}

function RecordedCodeTabs({ selectedTab, setSelectedTab }: IRecordedCodeTabs) {
  const tabs: RecordedCodeTab[] = [
    {
      id: "inline",
      name: "Inline",
    },
    {
      id: "suite",
      name: "Suite",
    },
  ];

  return (
    <EuiTabs>
      {tabs.map(({ id, name }) => (
        <EuiTab
          key={id}
          onClick={() => {
            if (selectedTab !== id) {
              setSelectedTab(id);
            }
          }}
          isSelected={selectedTab === id}
        >
          {name}
        </EuiTab>
      ))}
    </EuiTabs>
  );
}

interface ICodeFlyout {
  actions: ActionContext[][];
  code: string;
  setCode: Setter<string>;
  setIsFlyoutVisible: Setter<boolean>;
}

function CodeFlyout({
  actions,
  code,
  setCode,
  setIsFlyoutVisible,
}: ICodeFlyout) {
  const { ipc } = useContext(CommunicationContext);
  const [type, setType] = useState<JourneyType>("inline");
  useEffect(() => {
    (async function getCode() {
      const codeFromActions = await getCodeFromActions(ipc, actions, type);
      setCode(codeFromActions);
    })();
  }, [actions, setCode, type, ipc]);

  return (
    <EuiFlyout
      ownFocus
      onClose={() => setIsFlyoutVisible(false)}
      aria-labelledby="flyoutTitle"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id="flyoutTitle">Recorded Code</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <RecordedCodeTabs selectedTab={type} setSelectedTab={setType} />
        <EuiCodeBlock language="js" paddingSize="m" isCopyable>
          {code}
        </EuiCodeBlock>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

interface IStepsMonitor {
  isFlyoutVisible: boolean;
  setIsFlyoutVisible: Setter<boolean>;
}

export function StepsMonitor({
  isFlyoutVisible,
  setIsFlyoutVisible,
}: IStepsMonitor) {
  const { actions } = useContext(StepsContext);
  const [code, setCode] = useState("");

  return (
    <EuiPanel
      color="transparent"
      borderRadius="none"
      hasBorder={false}
      style={{ minHeight: 500 }}
    >
      <Steps />
      <EuiSpacer />

      {isFlyoutVisible && (
        <CodeFlyout
          actions={actions}
          code={code}
          setCode={setCode}
          setIsFlyoutVisible={setIsFlyoutVisible}
        />
      )}
    </EuiPanel>
  );
}
