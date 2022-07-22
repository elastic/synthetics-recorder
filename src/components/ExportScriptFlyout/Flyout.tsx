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

import { EuiFlyout } from '@elastic/eui';
// import type { Steps } from '@elastic/synthetics';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { getCodeFromActions } from '../../common/shared';
import type { Setter } from '../../common/types';
import type { JourneyType, Steps } from '../../../common/types';
import { CommunicationContext } from '../../contexts/CommunicationContext';
import { Body } from './Body';
import { Footer } from './Footer';
import { Header } from './Header';

interface IExportScriptFlyout {
  setVisible: Setter<boolean>;
  steps: Steps;
}

const FLYOUT_ID = 'export-script-flyout-title';

const LARGE_FLYOUT_SIZE_LINE_LENGTH = 100;

export function ExportScriptFlyout({ setVisible, steps }: IExportScriptFlyout) {
  const [code, setCode] = useState('');
  const { ipc } = useContext(CommunicationContext);
  const [exportAsProject, setExportAsProject] = useState(false);

  const type: JourneyType = exportAsProject ? 'project' : 'inline';

  const maxLineSize = useMemo(
    // get max line size in code string
    () => code.split('\n').reduce((prev, cur) => Math.max(prev, cur.length), 0),
    [code]
  );

  useEffect(() => {
    (async function getCode() {
      const codeFromActions = await getCodeFromActions(ipc, steps, type);
      setCode(codeFromActions);
    })();
  }, [ipc, steps, setCode, type]);

  return (
    <EuiFlyout
      aria-labelledby={FLYOUT_ID}
      onClose={() => setVisible(false)}
      size={maxLineSize > LARGE_FLYOUT_SIZE_LINE_LENGTH ? 'l' : 'm'}
    >
      <Header headerText="Journey code" id={FLYOUT_ID} />
      <Body code={code} exportAsProject={exportAsProject} setExportAsProject={setExportAsProject} />
      <Footer setVisible={setVisible} type={type} />
    </EuiFlyout>
  );
}
