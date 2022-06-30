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

import { RecordingStatus } from '../../common/types';
import { ICommunicationContext } from '../../contexts/CommunicationContext';
import { IRecordingContext } from '../../contexts/RecordingContext';
import { IStepsContext } from '../../contexts/StepsContext';
import { IUrlContext } from '../../contexts/UrlContext';

export const getRecordingContextDefaults = (): IRecordingContext => ({
  startOver: jest.fn(),
  isStartOverModalVisible: false,
  setIsStartOverModalVisible: jest.fn(),
  recordingStatus: RecordingStatus.NotRecording,
  togglePause: jest.fn(),
  toggleRecording: jest.fn(),
});

export const getUrlContextDefaults = (): IUrlContext => ({
  setUrl: jest.fn(),
  url: 'https://www.elastic.co',
});

export const getStepsContextDefaults = (): IStepsContext => ({
  steps: [],
  setSteps: jest.fn(),
  setStepName: jest.fn(),
  onDeleteAction: jest.fn(),
  onSoftDeleteAction: jest.fn(),
  onDeleteStep: jest.fn(),
  onInsertAction: jest.fn(),
  onDropStep: jest.fn(),
  onMergeSteps: jest.fn(),
  onRearrangeSteps: jest.fn(),
  onSetActionIsOpen: jest.fn(),
  onSplitStep: jest.fn(),
  onStepDetailChange: jest.fn(),
  onUpdateAction: jest.fn(),
});

export const getCommunicationContextDefaults = (): ICommunicationContext => ({
  // @ts-expect-error partial implementation for testing
  ipc: {
    answerMain: jest.fn(),
    callMain: jest.fn(),
    removeListener: jest.fn(),
  },
});
