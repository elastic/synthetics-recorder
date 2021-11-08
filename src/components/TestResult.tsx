import React, { useContext, useEffect, useState } from "react";
import {
  EuiAccordion,
  EuiButton,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
  useEuiTheme,
} from "@elastic/eui";

import { getCodeFromActions } from "../common/shared";
import { StepsContext } from "../contexts/StepsContext";
import type {
  ActionContext,
  Journey,
  JourneyStep,
  JourneyType,
  Result,
  ResultCategory,
  Setter,
} from "../common/types";

const { ipcRenderer: ipc } = window.require("electron-better-ipc");

const symbols: Record<ResultCategory, JSX.Element> = {
  succeeded: <EuiIcon color="success" type="check" />,
  failed: <EuiIcon color="danger" type="alert" />,
  skipped: <EuiIcon color="warning" type="flag" />,
};

function removeColorCodes(str = "") {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[.*?m/g, "");
}

function getStepActions(step: JourneyStep, currentActions: ActionContext[][]) {
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

function combineResultJourneys(journey: Journey) {
  const journeyArr = [];
  if (journey.inline) {
    journeyArr.push(journey.inline);
  }
  if (journey.suite) {
    journeyArr.push(journey.suite);
  }
  return journeyArr;
}

async function getCodeForResult(
  actions: ActionContext[][],
  journeys: Journey,
  type: string
) {
  const journeyArr = combineResultJourneys(journeys);
  const stepActions = journeyArr
    .map(({ steps }) => {
      for (const step of steps) {
        return getStepActions(step, actions) ?? null;
      }
      return null;
    })
    .filter(f => f !== null);

  // @ts-expect-error null elements are filtered out
  return await getCodeFromActions(stepActions ?? [], type);
}

interface IResultAccordions {
  codeBlocks: string;
  journeys: Journey;
}

function ResultAccordions({ codeBlocks, journeys }: IResultAccordions) {
  const journeyArr = combineResultJourneys(journeys);
  if (journeyArr.length === 0) return null;

  return (
    <>
      {journeyArr.map(({ steps }) => {
        return steps.map((step: JourneyStep, stepIndex: number) => {
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
      })}
    </>
  );
}

function TestButton({
  disabled,
  onTest,
}: {
  disabled: boolean;
  onTest: React.MouseEventHandler<HTMLButtonElement>;
}) {
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

interface ITestResult {
  setType: Setter<JourneyType>;
  type: JourneyType;
}

export function TestResult(props: ITestResult) {
  const { actions } = useContext(StepsContext);
  const [result, setResult] = useState<Result | undefined>(undefined);
  const [codeBlocks, setCodeBlocks] = useState("");

  useEffect(() => {
    if (actions.length === 0 && result) setResult(undefined);
  }, [actions.length, result]);

  const {
    euiTheme: {
      colors: { danger, success, warning },
    },
  } = useEuiTheme();

  const styles: Record<ResultCategory, { color: string }> = {
    succeeded: { color: success },
    failed: { color: danger },
    skipped: { color: warning },
  };

  const text: Record<
    ResultCategory,
    "success" | "error" | "errors" | "skipped"
  > = {
    succeeded: "success",
    failed: result?.failed === 1 ? "error" : "errors",
    skipped: "skipped",
  };

  const onTest: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const code = await getCodeFromActions(actions, props.type);
    const resultFromServer: Result = await ipc.callMain("run-journey", {
      code,
      isSuite: props.type === "suite",
    });
    setCodeBlocks(
      await getCodeForResult(actions, resultFromServer.journeys, props.type)
    );
    setResult(resultFromServer);
  };

  const ResultComponent = ({ result }: { result: Result }) => {
    const total = result.succeeded + result.skipped + result.failed;
    if (total === 0) return <EuiText color="subdued">No tests found</EuiText>;

    return (
      <EuiFlexGroup
        direction="column"
        gutterSize="s"
        style={{ padding: "0 7px" }}
      >
        <EuiFlexGroup gutterSize="m">
          {Object.keys(symbols).map((key, index) => {
            const keyAsCategory = key as ResultCategory;
            return (
              <EuiFlexItem key={index} grow={false}>
                <EuiText style={styles[key as ResultCategory]}>
                  {symbols[keyAsCategory]} {result[keyAsCategory]}{" "}
                  {text[keyAsCategory]}
                </EuiText>
              </EuiFlexItem>
            );
          })}
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <ResultAccordions
              {...props}
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
        <EuiFlexItem />
        <EuiFlexItem grow={false}>
          <TestButton disabled={actions.length === 0} onTest={onTest} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiPanel color="subdued">
        {result && <ResultComponent result={result}></ResultComponent>}
      </EuiPanel>
    </>
  );
}
