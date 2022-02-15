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

import {
  EuiAccordion,
  EuiFlexGroup,
  EuiIcon,
  EuiPanel,
  EuiText,
} from "@elastic/eui";
import React from "react";
import styled from "styled-components";
import type { StepStatus } from "../../common/types";

export const ResultContainer = styled(EuiPanel)`
  && {
    border-radius: ${props => props.theme.border.radius.medium};
  }
  padding: 0px;
  margin: 0px 0px 24px 0px;
`;

export const ResultHeader = styled.div`
  border-bottom: ${props => props.theme.border.thin};
  padding: 8px;
`;

export const ResultErrorAccordion = styled(EuiAccordion)`
  margin-right: 8px;
`;

export const ResultContentWithoutAccordion = styled(EuiFlexGroup)`
  padding: 8px;
`;

export const Bold = styled(EuiText)`
  font-weight: 500;
`;

export const symbols: Record<StepStatus, JSX.Element> = {
  succeeded: <EuiIcon color="success" type="check" />,
  failed: <EuiIcon color="danger" type="cross" />,
  skipped: <EuiIcon color="warning" type="flag" />,
};
