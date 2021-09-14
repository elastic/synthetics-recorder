import React from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiAccordion,
  EuiCodeBlock,
} from "@elastic/eui";

const styles = {
  succeeded: { color: "green", fontWeight: "bolder" },
  failed: { color: "red", fontWeight: "bolder" },
  skipped: { color: "orange", fontWeight: "bolder" },
};

const symbols = {
  succeeded: "✓",
  failed: "✘",
  skipped: "!",
};

function removeColorCodes(str = "") {
  return str.replace(/\u001b\[.*?m/g, "");
}

function ResultAccordions({ journeys }) {
  return Object.keys(journeys).map((name) => {
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
            <EuiText size="s">
              <span style={styles[status]}>{symbols[status]} </span>
              <span style={{ color: "gray" }}>
                {name} ({duration} ms)
              </span>
            </EuiText>
          }
          paddingSize="s"
          buttonClassName="euiAccordionForm__button"
        >
          {error && (
            <EuiCodeBlock
              language="js"
              paddingSize="none"
              style={{ maxWidth: 300 }}
            >
              {removeColorCodes(error.message)}
            </EuiCodeBlock>
          )}
        </EuiAccordion>
      );
    });
  });
}

export function TestResult(props) {
  const ResultComponent = ({ result }) => {
    if (result.total === 0)
      return <EuiText color="subdued">No tests found</EuiText>;

    return (
      <EuiFlexGroup direction="column" style={{ padding: "0 7px" }}>
        <EuiFlexGroup gutterSize="m">
          {Object.keys(symbols).map((key, index) => (
            <EuiFlexItem key={index} grow={false}>
              <EuiText style={styles[key]}>
                {symbols[key]} {result[key]}
              </EuiText>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <ResultAccordions journeys={result.journeys} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    );
  };

  return (
    <EuiPanel color="transparent" hasBorder borderRadius="none">
      <EuiText size="m">
        <strong>Test Result</strong>
      </EuiText>
      <EuiSpacer />
      {props.result && (
        <ResultComponent result={props.result}></ResultComponent>
      )}
    </EuiPanel>
  );
}
