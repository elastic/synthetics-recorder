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

import React, { useContext, useEffect } from "react";
import {
  EuiAccordion,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from "@elastic/eui";

import { StepsContext } from "../contexts/StepsContext";
import type {
  Journey,
  JourneyStep,
  Result,
  ResultCategory,
} from "../common/types";
import { TestContext } from "../contexts/TestContext";

const symbols: Record<ResultCategory, JSX.Element> = {
  succeeded: <EuiIcon color="success" type="check" />,
  failed: <EuiIcon color="danger" type="alert" />,
  skipped: <EuiIcon color="warning" type="flag" />,
};

function removeColorCodes(str = "") {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[.*?m/g, "");
}

interface IResultAccordions {
  codeBlocks: string;
  journey: Journey;
}

function ResultAccordions({ codeBlocks, journey }: IResultAccordions) {
  return (
    <>
      {journey.steps.map((step: JourneyStep, stepIndex: number) => {
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
      })}
    </>
  );
}

export function TestResult() {
  const { steps } = useContext(StepsContext);
  const { codeBlocks, result, setResult } = useContext(TestContext);

  useEffect(() => {
    if (steps.length === 0 && result) setResult(undefined);
  }, [steps.length, result, setResult]);

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
              codeBlocks={codeBlocks}
              journey={result.journey}
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
      </EuiFlexGroup>
      <EuiPanel color="subdued">
        {result && <ResultComponent result={result}></ResultComponent>}
      </EuiPanel>
    </>
  );
}
