import React, { useContext, useEffect, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
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

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

interface IStepsFooter {
  actions: ActionContext[][];
  setCode: Setter<string>;
  setIsFlyoutVisible: Setter<boolean>;
  type: JourneyType;
}

function StepsFooter({
  actions,
  setCode,
  setIsFlyoutVisible,
  type,
}: IStepsFooter) {
  useEffect(() => {
    (async function getCode() {
      const codeFromActions = await getCodeFromActions(actions, type);
      setCode(codeFromActions);
    })();
  }, [actions, setCode, type]);

  const showFlyout = async () => {
    setIsFlyoutVisible(true);
  };

  const onSave = async () => {
    const codeFromActions = await getCodeFromActions(actions, "inline");
    await ipc.callMain("save-file", codeFromActions);
  };

  return (
    <EuiFlexGroup justifyContent="spaceBetween">
      <EuiFlexItem grow={false}>
        <EuiButtonEmpty
          iconType="eye"
          iconSide="right"
          color="text"
          onClick={showFlyout}
        >
          Show recorded code
        </EuiButtonEmpty>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton fill color="success" onClick={onSave}>
          Export script
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

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
  setType: Setter<JourneyType>;
  type: JourneyType;
}

function CodeFlyout({
  actions,
  code,
  setCode,
  setIsFlyoutVisible,
  setType,
  type,
}: ICodeFlyout) {
  useEffect(() => {
    (async function getCode() {
      const codeFromActions = await getCodeFromActions(actions, type);
      setCode(codeFromActions);
    })();
  }, [actions, setCode, type]);

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

export function StepsMonitor() {
  const { actions } = useContext(StepsContext);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<JourneyType>("inline");

  return (
    <>
      <EuiPanel
        color="transparent"
        borderRadius="none"
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
            setType={setType}
            type={type}
          />
        )}
      </EuiPanel>
      <StepsFooter
        actions={actions}
        setCode={setCode}
        setIsFlyoutVisible={setIsFlyoutVisible}
        type={type}
      />
    </>
  );
}
