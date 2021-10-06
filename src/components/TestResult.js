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
      Array.isArray(currentActions) &&
      currentActions.length > 0 &&
      currentActions[i][0].title === step.name
    ) {
      return currentActions[i];
    }
  }
}

function ResultAccordions({ actions, journeys, type }) {
  const [codeBlocks, setCodeBlocks] = useState({});

  useEffect(() => {
    Object.keys(journeys).forEach(name => {
      if (Array.isArray(journeys[name].steps)) {
        journeys[name].steps.forEach(step => {
          const stepActions = getStepActions(step, actions);
          getCodeFromActions(stepActions, type).then(code => {
            setCodeBlocks(oldBlocks => ({ ...oldBlocks, [step.name]: code }));
          });
        });
      }
    });
  }, [journeys, codeBlocks, setCodeBlocks]);

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
                {codeBlocks[name] ?? null}
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

export function TestResult(props) {
  const { actions } = useContext(StepsContext);
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
    failed: props.result.failed === 1 ? "error" : "errors",
    skipped: "skipped",
  };

  const onTest = async () => {
    const code = await getCodeFromActions(actions, props.type);
    const result = await ipc.callMain("run-journey", {
      code,
      isSuite: props.type === "suite",
    });
    props.onTestRun(result);
  };

  const ResultComponent = ({ result }) => {
    if (result.total === 0)
      return <EuiText color="subdued">No tests found</EuiText>;

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
              journeys={result.journeys}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    );
  };

  return (
    <>
      <EuiFlexGroup gutterSize="m" style={{ maxHeight: 90 }} wrap>
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
          <EuiButton
            aria-label="Perform a test run for the journey you have recorded"
            color="primary"
            onClick={onTest}
          >
            Test
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiPanel color="subdued">
        {props.result && (
          <ResultComponent result={props.result}></ResultComponent>
        )}
      </EuiPanel>
    </>
  );
}
