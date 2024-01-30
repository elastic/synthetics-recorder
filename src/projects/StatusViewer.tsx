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

import { EuiFlexGroup, EuiFlexItem, EuiHealth, EuiSpacer } from '@elastic/eui';
import React, { useMemo } from 'react';

interface Props {
  upMonitors: any;
  downMonitors: any;
  selectedProjectName: string;
}
interface Status {
  name: string;
  project: {
    name: string;
  };
  status: 'up' | 'down';
}

export function StatusViewer({ upMonitors, downMonitors, selectedProjectName }: Props) {
  const statuses: Status[] = useMemo(() => {
    const list: Status[] = [];
    const upKeys = Object.keys(upMonitors);
    const downKeys = Object.keys(downMonitors);
    for (const upKey of upKeys) {
      const monitor = upMonitors[upKey]?.ping?.monitor;
      const { name } = monitor;
      const project = monitor?.project;
      if (project?.name === selectedProjectName) {
        list.push({ name, project, status: 'up' });
      }
    }
    for (const downKey of downKeys) {
      const monitor = downMonitors[downKey]?.ping?.monitor;
      const { name } = monitor;
      const project = monitor?.project;
      if (project?.name === selectedProjectName) {
        list.push({ name, project, status: 'down' });
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [downMonitors, selectedProjectName, upMonitors]);

  if (!upMonitors || !downMonitors) return null;

  return (
    <React.Fragment>
      <EuiSpacer />
      <EuiFlexGroup direction="column">
        {statuses.map(({ name, project: { name: projectName }, status }) => (
          <EuiFlexGroup key={name + projectName}>
            <EuiFlexItem grow={false}>
              <EuiHealth color={status === 'up' ? 'success' : 'danger'} />
            </EuiFlexItem>
            <EuiFlexItem>{name}</EuiFlexItem>
          </EuiFlexGroup>
        ))}
      </EuiFlexGroup>
    </React.Fragment>
  );
}
/*
step('goto site', async () => {
	await page.goto('https://www.elastic.co/');
});
step('nav', async () => {
	await page.getByRole('link', { name: 'Login', exact: true }).click();
});
step('user input', async () => {
	await page.locator('[data-test-id="login-username"]').fill('test-user');
	await page.locator('[data-test-id="login-username"]').press('Tab');
	await page.locator('[data-test-id="login-password"]').fill('test-pass');
	await page.locator('[data-test-id="login-password"]').press('Tab');
	await page.getByLabel('Show password as plain text. Note: this will visually expose your password on the screen.').press('Enter');
});
step('click button', async () => {
	await page.locator('[data-test-id="login-button"]').click();
});
step('assert', async () => {
	await page.getByText('The email address or password you entered is incorrect. Please try again.').click();
});
*/
