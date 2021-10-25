import React, { useContext, useEffect, useState } from "react";
import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  useEuiTheme,
} from "@elastic/eui";
import { RecordingContext } from "../contexts/RecordingContext";

interface IHeader {
  onUrlChange: (url: string) => void;
  url: string;
}

export function Header(props: IHeader) {
  const { isRecording, isPaused, toggleRecording, togglePause } =
    useContext(RecordingContext);

  const onUrlFieldKeyUp = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRecording) {
      await toggleRecording();
    }
  };

  return (
    <>
      <EuiFlexGroup wrap gutterSize="s">
        <EuiFlexItem>
          <EuiFieldText
            placeholder="Enter URL to test"
            value={props.url}
            onKeyUp={onUrlFieldKeyUp}
            onChange={e => props.onUrlChange(e.target.value)}
            fullWidth
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ControlButton
            aria-label="Toggle script recording on/off"
            fill
            color="primary"
            iconType={isRecording ? "stop" : "play"}
            onClick={toggleRecording}
          >
            {isRecording ? "Stop" : "Start recording"}
          </ControlButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ControlButton
            aria-label="Toggle script recording pause/continue"
            disabled={!isRecording}
            color="primary"
            iconType={isPaused ? "play" : "pause"}
            onClick={togglePause}
          >
            {isPaused ? "Resume" : "Pause"}
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
