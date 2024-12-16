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

import { EuiAccordion, EuiButtonIcon, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import styled from 'styled-components';
import { SMALL_SCREEN_BREAKPOINT } from '../../common/shared';

interface IControlsWrapper {
  isGrabbing: boolean | null;
  draggable?: boolean;
}

export const ControlsWrapper = styled(EuiFlexGroup)<IControlsWrapper>`
  cursor: ${({ isGrabbing, draggable }) =>
    isGrabbing === null || !draggable ? 'default' : isGrabbing ? 'grabbing' : 'grab'};
`;

export const StepSeparatorTopBorder = styled(EuiFlexItem)`
  border-top: ${props => props.theme.border.thin};

  @media (max-width: ${SMALL_SCREEN_BREAKPOINT}px) {
    max-width: 566px;
  }
`;

export const StepSeparatorAccordion = styled(EuiAccordion)`
  .euiAccordion__button {
    width: auto;
    flex-grow: 0;
  }

  .euiAccordion__optionalAction {
    flex-grow: 1;
    flex-shrink: 1;
  }

  div[id^='step-separator-'] {
    overflow: visible;
  }

  margin: 16px;
`;

export const StepSeparatorHeading = styled(EuiFlexItem)`
  font-weight: bold;
`;

interface IDeleteButtonProps {
  isVisible: boolean;
}

export const DeleteButton = styled(EuiButtonIcon)<IDeleteButtonProps>`
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')};
`;
