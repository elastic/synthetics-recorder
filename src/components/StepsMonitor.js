import React, { useState, useContext } from "react";
import {
  EuiFlexItem,
  EuiSpacer,
  EuiButton,
  EuiPanel,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiCodeBlock,
  EuiFlexGroup,
} from "@elastic/eui";
import { getCodeFromActions } from "../common/shared";
import { Steps } from "./Steps";
import { StepsContext } from "../contexts/StepsContext";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

function StepsFooter({ actions, setCode, setIsFlyoutVisible, type }) {
  const showFlyout = async () => {
    const code = await getCodeFromActions(actions, type);
    setCode(code);
    setIsFlyoutVisible(true);
  };

  const onSave = async () => {
    const code = await getCodeFromActions(actions, type);
    await ipc.callMain("save-file", code);
  };

  return (
    <EuiFlexGroup justifyContent="spaceBetween">
      <EuiFlexItem grow={false}>
        <EuiButton
          iconType="eye"
          iconSide="right"
          color="text"
          onClick={showFlyout}
        >
          Show Script
        </EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton fill color="success" onClick={onSave}>
          Export script
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export function StepsMonitor(props) {
  const { actions } = useContext(StepsContext);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [code, setCode] = useState("");

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
              <EuiCodeBlock language="js" paddingSize="m" isCopyable>
                {code}
              </EuiCodeBlock>
            </EuiFlyoutBody>
          </EuiFlyout>
        )}
      </EuiPanel>
      <StepsFooter
        actions={actions}
        setCode={setCode}
        setIsFlyoutVisible={setIsFlyoutVisible}
        type={props.type}
      />
    </>
  );
}
