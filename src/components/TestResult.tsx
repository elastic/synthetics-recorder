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

import React, { useContext, useEffect, useState } from "react";
import {
  EuiAccordion,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiIcon,
  EuiPanel,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { StepsContext } from "../contexts/StepsContext";
import type { JourneyStep, Result, ResultCategory } from "../common/types";
import { TestContext } from "../contexts/TestContext";
import { getCodeFromActions } from "../common/shared";
import styled from "styled-components";

const symbols: Record<ResultCategory, JSX.Element> = {
  succeeded: <EuiIcon color="success" type="check" />,
  failed: <EuiIcon color="danger" type="cross" />,
  skipped: <EuiIcon color="warning" type="flag" />,
};

function removeColorCodes(str = "") {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[.*?m/g, "");
}

const ResultContainer = styled(EuiPanel)`
  padding: 0px;
  margin: 0px 0px 24px 0px;
`;

const ResultHeader = styled.div`
  border-bottom: ${props => props.theme.border.thin};
  padding: 8px;
`;

const ResultContentWithoutAccordion = styled(EuiFlexGroup)`
  padding: 8px;
`;

const Bold = styled(EuiText)`
  font-weight: 500;
`;

export function TestResult() {
  const { steps } = useContext(StepsContext);
  const { isResultFlyoutVisible, result, setResult, setIsResultFlyoutVisible } =
    useContext(TestContext);
  const [stepCodeToDisplay, setStepCodeToDisplay] = useState("");

  useEffect(() => {
    async function fetchCodeForFailure(r: Result) {
      const failedCode = await getCodeFromActions(
        // index of failed step will equal number of successful items
        [steps[r.succeeded]],
        "inline"
      );
      setStepCodeToDisplay(failedCode);
    }

    if (steps.length === 0 && result) {
      setResult(undefined);
    }

    if (steps.length && result) {
      fetchCodeForFailure(result);
    }
  }, [steps, result, setResult]);

  if (!isResultFlyoutVisible || !result) return null;

  const total = result.succeeded + result.skipped + result.failed;

  if (total === 0) return null;

  return result ? (
    <EuiFlyout
      aria-labelledby="result-flyout-title"
      onClose={() => setIsResultFlyoutVisible(false)}
      size={result.failed === 0 ? "s" : "l"}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id="result-flyout-title">Journey Test Result</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {result.journey.steps.map((step: JourneyStep, stepIndex: number) => {
          const { name, status, error, duration } = step;
          const resultIndicator = <Bold>{`Step ${stepIndex + 1}`}</Bold>;
          const durationElement = (
            <EuiText size="s">{Math.round(duration / 1000)}s</EuiText>
          );
          return error ? (
            <ResultContainer hasShadow={false}>
              <ResultHeader>{resultIndicator}</ResultHeader>
              <EuiAccordion
                id={step.name}
                initialIsOpen
                buttonContent={
                  <EuiFlexGroup alignItems="center" gutterSize="xs">
                    <EuiFlexItem grow={false}>{symbols["failed"]}</EuiFlexItem>
                    <EuiFlexItem>
                      <EuiText size="s">{name}</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                extraAction={durationElement}
                key={stepIndex}
                paddingSize="s"
                buttonClassName="euiAccordionForm__button"
                style={{ marginRight: 8 }}
              >
                {error && (
                  <>
                    <EuiCodeBlock
                      language="js"
                      paddingSize="m"
                      style={{ maxWidth: 300 }}
                      whiteSpace="pre"
                    >
                      {stepCodeToDisplay}
                    </EuiCodeBlock>
                    <EuiCodeBlock paddingSize="m">
                      {removeColorCodes(error.message)}
                    </EuiCodeBlock>
                  </>
                )}
              </EuiAccordion>
            </ResultContainer>
          ) : (
            <ResultContainer hasShadow={false}>
              <ResultHeader>{resultIndicator}</ResultHeader>
              <ResultContentWithoutAccordion
                alignItems="center"
                gutterSize="xs"
              >
                <EuiFlexItem grow={false}>{symbols[status]}</EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size="s">{name}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>{durationElement}</EuiFlexItem>
              </ResultContentWithoutAccordion>
            </ResultContainer>
          );
        })}
      </EuiFlyoutBody>
    </EuiFlyout>
  ) : null;
}
