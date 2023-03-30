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
  EuiBetaBadge,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPageHeader,
  EuiThemeContext,
} from '@elastic/eui';
import React, { useContext } from 'react';
import { createExternalLinkHandler, SYNTHETICS_DISCUSS_FORUM_URL } from '../../common/shared';
import { CommunicationContext } from '../../contexts/CommunicationContext';

export function Title() {
  const { electronAPI } = useContext(CommunicationContext);
  const euiTheme = useContext(EuiThemeContext);

  return (
    <EuiPageHeader
      style={{
        backgroundColor: euiTheme.colors.emptyShade,
        borderBottom: euiTheme.border.thin,
        paddingLeft: 4,
        paddingRight: 4,
        boxShadow: `0px 2px ${euiTheme.colors.lightestShade}`,
      }}
      paddingSize="xs"
    >
      <EuiFlexGroup alignItems="center" gutterSize="s" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiIcon size="l" type="logoElastic" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <h1
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Elastic Synthetics Recorder
          </h1>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiBetaBadge alignment="middle" label="BETA" />
        </EuiFlexItem>
        <EuiFlexItem />
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            href={SYNTHETICS_DISCUSS_FORUM_URL}
            iconSide="left"
            iconType="popout"
            key="link-to-synthetics-help"
            onClick={createExternalLinkHandler(electronAPI, SYNTHETICS_DISCUSS_FORUM_URL)}
          >
            Send feedback
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageHeader>
  );
}
