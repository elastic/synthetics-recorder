import React, { useContext, useEffect, useState } from "react";
import {
  EuiAccordion,
  EuiButton,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
  useEuiTheme,
} from "@elastic/eui";

import { getCodeFromActions } from "../common/shared";
import { StepsContext } from "../contexts/StepsContext";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

const symbols = {
  succeeded: <EuiIcon color="success" type="check" />,
  failed: <EuiIcon color="danger" type="alert" />,
  skipped: <EuiIcon color="warning" type="flag" />,
};

function removeColorCodes(str = "") {
  return str.replace(/\u001b\[.*?m/g, "");
}

function getStepActions(step, currentActions) {
  if (!step.name) return;
  for (let i = 0; i < currentActions.length; i++) {
    if (
      currentActions[i].length > 0 &&
      currentActions[i][0].title === step.name
    ) {
      return currentActions[i];
    }
  }
}

async function getCodeForResult(actions, journeys, type) {
  const stepActions = Object.keys(journeys).map(name => {
    for (const step of journeys[name].steps) {
      return getStepActions(step, actions);
    }
  });
  return await getCodeFromActions(stepActions, type);
}

function ResultAccordions({ codeBlocks, journeys }) {
  return Object.keys(journeys).map(name => {
    const { steps } = journeys[name];
    return steps.map((step, stepIndex) => {
      const { name, status, error, duration } = step;
      return (
        <EuiAccordion
          id={step.name}
          key={stepIndex}
          arrowDisplay="none"
          forceState={status === "failed" ? "open" : "closed"}
          buttonContent={
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>{symbols[status]}</EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="s" style={{ fontWeight: 500 }}>
                  {name} ({duration} ms)
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          }
          paddingSize="s"
          buttonClassName="euiAccordionForm__button"
        >
          {error && (
            <>
              <EuiCodeBlock
                language="js"
                paddingSize="m"
                style={{ maxWidth: 300 }}
                transparentBackground={true}
              >
                {codeBlocks ?? null}
              </EuiCodeBlock>
              <EuiCodeBlock paddingSize="m" transparentBackground={true}>
                {removeColorCodes(error.message)}
              </EuiCodeBlock>
            </>
          )}
        </EuiAccordion>
      );
    });
  });
}

function TestButton({ disabled, onTest }) {
  const ariaLabel = disabled
    ? "Record a step in order to run a test"
    : "Perform a test run for the journey you have recorded";
  const button = (
    <EuiButton
      aria-label={ariaLabel}
      color="primary"
      isDisabled={disabled}
      onClick={onTest}
    >
      Test
    </EuiButton>
  );
  if (disabled) {
    return (
      <EuiToolTip content="Record a step in order to run a test" delay="long">
        {button}
      </EuiToolTip>
    );
  }
  return button;
}

export function TestResult(props) {
  const { actions } = useContext(StepsContext);
  const [result, setResult] = useState(undefined);
  const [codeBlocks, setCodeBlocks] = useState({});

  useEffect(() => {
    if (actions.length == 0 && result) setResult(undefined);
  }, [actions.length]);

  const {
    euiTheme: {
      colors: { danger, success, warning },
    },
  } = useEuiTheme();

  const styles = {
    succeeded: { color: success },
    failed: { color: danger },
    skipped: { color: warning },
  };

  const text = {
    succeeded: "success",
    failed: result?.failed === 1 ? "error" : "errors",
    skipped: "skipped",
  };

  const onTest = async () => {
    const code = await getCodeFromActions(actions, props.type);
    const resultFromServer = await ipc.callMain("run-journey", {
      code,
      isSuite: props.type === "suite",
    });
    setCodeBlocks(
      await getCodeForResult(actions, resultFromServer.journeys, props.type)
    );
    setResult(resultFromServer);
  };

  const ResultComponent = ({ result }) => {
    const total = result.succeeded + result.skipped + result.failed;
    if (total === 0) return <EuiText color="subdued">No tests found</EuiText>;

    return (
      <EuiFlexGroup
        direction="column"
        gutterSize="s"
        style={{ padding: "0 7px" }}
      >
        <EuiFlexGroup gutterSize="m">
          {Object.keys(symbols).map((key, index) => (
            <EuiFlexItem key={index} grow={false}>
              <EuiText style={styles[key]}>
                {symbols[key]} {result[key]} {text[key]}
              </EuiText>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <ResultAccordions
              {...props}
              actions={actions}
              codeBlocks={codeBlocks}
              journeys={result.journeys}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    );
  };

  return (
    <>
      <EuiFlexGroup
        alignItems="baseline"
        gutterSize="m"
        style={{ minHeight: 130, maxHeight: 130 }}
        wrap
      >
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h3>Test your script</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSelect
            aria-label="Use this input to change the type of journey between inline and suite."
            id="selectJourneyType"
            onChange={e => props.setType(e.target.value)}
            options={[
              { value: "inline", text: "Inline" },
              { value: "suite", text: "Suite" },
            ]}
            value={props.type}
          />
        </EuiFlexItem>
        <EuiFlexItem />
        <EuiFlexItem grow={false}>
          <TestButton disabled={actions.length == 0} onTest={onTest} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiPanel color="subdued">
        {result && <ResultComponent result={result}></ResultComponent>}
      </EuiPanel>
    </>
  );
}
