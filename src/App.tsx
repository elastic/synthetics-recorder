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
import React, { useContext } from 'react';
import { useEffect, useState } from 'react';
import { EuiCode, EuiEmptyPrompt, EuiGlobalToastList, EuiProvider } from '@elastic/eui';
// import type { Steps } from '@elastic/synthetics';
import createCache from '@emotion/cache';
import '@elastic/eui/dist/eui_theme_light.css';
import { Title } from './components/Header/Title';
import { HeaderControls } from './components/Header/HeaderControls';
import { CommunicationContext } from './contexts/CommunicationContext';
import { DragAndDropContext } from './contexts/DragAndDropContext';
import { RecordingContext } from './contexts/RecordingContext';
import { UrlContext } from './contexts/UrlContext';
import { StepsContext } from './contexts/StepsContext';
import { TestContext } from './contexts/TestContext';
import { ToastContext } from './contexts/ToastContext';
import { useDragAndDropContext } from './hooks/useDragAndDropContext';
import { useGlobalToasts } from './hooks/useGlobalToasts';
import { useStepsContext } from './hooks/useStepsContext';
import { useSyntheticsTest } from './hooks/useSyntheticsTest';
import { generateIR, generateMergedIR } from './helpers/generator';
import { StepSeparator } from './components/StepSeparator';

import { TestResult } from './components/TestResult';
import { AppPageBody } from './components/AppPageBody';
import { StyledComponentsEuiProvider } from './contexts/StyledComponentsEuiProvider';
import { ExportScriptFlyout } from './components/ExportScriptFlyout';
import { useRecordingContext } from './hooks/useRecordingContext';
import { StartOverWarningModal } from './components/StartOverWarningModal';
import { ActionContext, RecorderSteps, Steps } from '../common/types';

/**
 * This is the prescribed workaround to some internal EUI issues that occur
 * when EUI component styles load before the global styles. For more information, see
 * https://elastic.github.io/eui/#/utilities/provider#global-styles.
 */
const cache = createCache({
  key: 'elastic-synthetics-recorder',
  container: document.querySelector<HTMLElement>('meta[name="global-style-insert"]') ?? undefined,
});

export default function App() {
  const [url, setUrl] = useState('');
  const [isCodeFlyoutVisible, setIsCodeFlyoutVisible] = useState(false);

  const { ipc } = useContext(CommunicationContext);
  const stepsContextUtils = useStepsContext();
  const { steps, setSteps } = stepsContextUtils;
  const syntheticsTestUtils = useSyntheticsTest(steps);
  const recordingContextUtils = useRecordingContext(
    ipc,
    url,
    steps.length,
    syntheticsTestUtils.setResult,
    setSteps
  );
  const { isStartOverModalVisible, setIsStartOverModalVisible, startOver } = recordingContextUtils;
  const dragAndDropContext = useDragAndDropContext();

  const { dismissToast, sendToast, setToastLifeTimeMs, toasts, toastLifeTimeMs } =
    useGlobalToasts();

  useEffect(() => {
    // `actions` here is a set of `ActionInContext`s that make up a `Step`
    const listener = ({ actions }: { actions: ActionContext[] }) => {
      setSteps((prevSteps: RecorderSteps) => {
        const nextSteps: Steps = generateIR([{ actions }]);
        return generateMergedIR(prevSteps, nextSteps);
      });
    };
    ipc.answerMain('change', listener);
    return () => {
      ipc.removeListener('change', listener);
    };
  }, [ipc, setSteps]);

  return (
    <EuiProvider cache={cache} colorMode="light">
      <StyledComponentsEuiProvider>
        <StepsContext.Provider value={stepsContextUtils}>
          <RecordingContext.Provider value={recordingContextUtils}>
            <TestContext.Provider value={syntheticsTestUtils}>
              <UrlContext.Provider value={{ url, setUrl }}>
                <DragAndDropContext.Provider value={dragAndDropContext}>
                  <ToastContext.Provider
                    value={{ dismissToast, sendToast, setToastLifeTimeMs, toasts, toastLifeTimeMs }}
                  >
                    <Title />
                    <HeaderControls setIsCodeFlyoutVisible={setIsCodeFlyoutVisible} />
                    <AppPageBody>
                      {steps.length === 0 && (
                        <EuiEmptyPrompt
                          hasBorder={false}
                          title={<h3>No steps recorded yet</h3>}
                          body={
                            <p>
                              Click on <EuiCode>Start recording</EuiCode> to get started with your
                              script.
                            </p>
                          }
                        />
                      )}
                      {steps.map((step, index) => (
                        <StepSeparator
                          index={index}
                          key={`step-separator-${index + 1}`}
                          step={step}
                        />
                      ))}
                      <TestResult />
                      {isCodeFlyoutVisible && (
                        <ExportScriptFlyout setVisible={setIsCodeFlyoutVisible} steps={steps} />
                      )}
                      {isStartOverModalVisible && (
                        <StartOverWarningModal
                          startOver={startOver}
                          setVisibility={setIsStartOverModalVisible}
                          stepCount={steps.length}
                        />
                      )}
                    </AppPageBody>
                    <EuiGlobalToastList
                      toasts={toasts}
                      dismissToast={dismissToast}
                      toastLifeTimeMs={toastLifeTimeMs}
                    />
                  </ToastContext.Provider>
                </DragAndDropContext.Provider>
              </UrlContext.Provider>
            </TestContext.Provider>
          </RecordingContext.Provider>
        </StepsContext.Provider>
      </StyledComponentsEuiProvider>
    </EuiProvider>
  );
}
