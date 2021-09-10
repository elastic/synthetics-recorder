import React, { useState } from "react";
import {
  EuiFlexItem,
  EuiSpacer,
  EuiButton,
  EuiPanel,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiCodeBlock,
} from "@elastic/eui";
import { Steps } from "./Steps";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

export function StepsMonitor(props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [code, setCode] = useState("");

  const closeModal = () => setIsModalVisible(false);
  const showModal = async () => {
    const code = await ipc.callMain("actions-to-code", {
      actions: props.currentActions,
      isSuite: props.type == "suite",
    });
    setCode(code);
    setIsModalVisible(true);
  };

  let modal;
  if (isModalVisible) {
    modal = (
      <EuiModal style={{ width: 700 }} onClose={closeModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>Recorded Code</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiCodeBlock language="js" paddingSize="m" isCopyable>
            {code}
          </EuiCodeBlock>
        </EuiModalBody>
      </EuiModal>
    );
  }

  return (
    <EuiPanel hasBorder={true} color="transparent">
      <EuiFlexItem>
        <Steps url={props.url} onUpdateActions={props.onUpdateActions} />
      </EuiFlexItem>
      <EuiSpacer />
      <EuiButton
        iconType="arrowUp"
        iconSide="right"
        color="text"
        onClick={showModal}
      >
        Show Script
      </EuiButton>
      {modal}
    </EuiPanel>
  );
}
