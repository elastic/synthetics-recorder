import { useState, useContext } from "react";
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
import type { JourneyType, Setter } from "../common/types";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

interface IStepsFooter {
  setCode: Setter<string>;
  setIsFlyoutVisible: Setter<boolean>;
  type: JourneyType;
}

function StepsFooter({ setCode, setIsFlyoutVisible, type }: IStepsFooter) {
  const { actions } = useContext(StepsContext);
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

interface IStepsMonitor {
  type: JourneyType;
}

export function StepsMonitor({ type }: IStepsMonitor) {
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
        setCode={setCode}
        setIsFlyoutVisible={setIsFlyoutVisible}
        type={type}
      />
    </>
  );
}
