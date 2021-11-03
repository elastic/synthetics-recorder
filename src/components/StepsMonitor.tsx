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
  code: string;
  setCode: Setter<string>;
  setIsFlyoutVisible: Setter<boolean>;
  type: JourneyType;
}
function StepsFooter({
  actions,
  code,
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
    await ipc.callMain("save-file", code);
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
        )}
      </EuiPanel>
      <StepsFooter
        actions={actions}
        code={code}
        setCode={setCode}
        setIsFlyoutVisible={setIsFlyoutVisible}
        type={type}
      />
    </>
  );
}
