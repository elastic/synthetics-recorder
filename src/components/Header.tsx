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

import React, { useContext, useEffect, useRef, useState } from "react";
import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
} from "@elastic/eui";
import { RecordingContext } from "../contexts/RecordingContext";
import { StartOverWarningModal } from "./StartOverWarningModal";

interface IHeader {
  onUrlChange: (url: string) => void;
  stepCount: number;
  url: string;
}

export function Header(props: IHeader) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { abortSession, isRecording, isPaused, togglePause, toggleRecording } =
    useContext(RecordingContext);

  const onUrlFieldKeyUp = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRecording) {
      await toggleRecording();
    }
  };

  const urlRef = useRef<null | HTMLInputElement>(null);

  const startOver = React.useCallback(async () => {
    await abortSession();
    setIsModalVisible(false);
    if (urlRef) urlRef.current?.focus();
  }, [abortSession]);

  return (
    <>
      {isModalVisible && (
        <StartOverWarningModal
          close={() => setIsModalVisible(false)}
          startOver={startOver}
          stepCount={props.stepCount}
        />
      )}
      <EuiFlexGroup wrap gutterSize="s">
        <EuiFlexItem>
          <EuiFieldText
            placeholder="Enter URL to test"
            value={props.url}
            onKeyUp={onUrlFieldKeyUp}
            onChange={e => props.onUrlChange(e.target.value)}
            fullWidth
            inputRef={urlRef}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ControlButton
            aria-label="Toggle the script recorder between recording and paused"
            fill
            color="primary"
            iconType={isRecording ? "pause" : "play"}
            onClick={!isRecording ? toggleRecording : togglePause}
          >
            {isRecording ? (isPaused ? "Resume" : "Pause") : "Start recording"}
          </ControlButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ControlButton
            aria-label="Stop recording and clear all recorded actions"
            disabled={!isRecording}
            color="primary"
            iconType="refresh"
            onClick={() => {
              if (!isModalVisible) {
                setIsModalVisible(true);
              }
            }}
          >
            Start over
          </ControlButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}

interface IControlButton {
  "aria-label": string;
  color: "primary";
  disabled?: boolean;
  fill?: boolean;
  iconType: string;
  onClick: () => void;
}

const ControlButton: React.FC<IControlButton> = props => {
  const [showIconOnly, setShowIconOnly] = useState(false);
  const {
    euiTheme: {
      breakpoint: { l },
    },
  } = useEuiTheme();

  useEffect(() => {
    function evaluateSize() {
      if (window.innerWidth >= l && showIconOnly) {
        setShowIconOnly(false);
      } else if (window.innerWidth < l && !showIconOnly) {
        setShowIconOnly(true);
      }
    }
    window.addEventListener("resize", evaluateSize);
    return () => window.removeEventListener("resize", evaluateSize);
  }, [l, showIconOnly]);

  if (showIconOnly) {
    const { children, fill, ...rest } = props;
    return (
      <EuiButtonIcon display={fill ? "fill" : "base"} size="m" {...rest} />
    );
  }
  return <EuiButton {...props} />;
};
