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
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { createExternalLinkHandler, PLAYWRIGHT_ASSERTION_DOCS_LINK } from '../../common/shared';
import { CommunicationContext } from '../../contexts/CommunicationContext';

const InfoPopoverTitle = styled(EuiTitle)`
  border-bottom: ${(props) => props.theme.border.thin};
  padding: 8px;
`;

const InfoPopoverTextWrapper = styled(EuiText)`
  padding: 8px;
`;

const AssertionInfoText = styled(EuiText)`
  padding-left: 8px;
  max-width: 280px;
`;

export function AssertionInfo() {
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState(false);
  const { ipc } = useContext(CommunicationContext);
  return (
    <EuiPopover
      button={
        <EuiButtonIcon
          aria-label="Shows a popover with more information about Playwright assertions."
          iconType="iInCircle"
          onClick={() => setIsInfoPopoverOpen(!isInfoPopoverOpen)}
        />
      }
      isOpen={isInfoPopoverOpen}
      closePopover={() => setIsInfoPopoverOpen(false)}
      panelPaddingSize="none"
    >
      <InfoPopoverTitle size="xs">
        <h4>Add assertion</h4>
      </InfoPopoverTitle>
      <InfoPopoverTextWrapper>
        <EuiFlexGroup alignItems="flexStart" direction="column" gutterSize="none">
          <EuiFlexItem grow={false}>
            <AssertionInfoText>
              You can add assertions to validate your page&apos;s content matches your expectations.
            </AssertionInfoText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              href={PLAYWRIGHT_ASSERTION_DOCS_LINK}
              onClick={createExternalLinkHandler(ipc, PLAYWRIGHT_ASSERTION_DOCS_LINK)}
            >
              Read more
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </InfoPopoverTextWrapper>
    </EuiPopover>
  );
}
