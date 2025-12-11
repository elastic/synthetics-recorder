# Updating @elastic/synthetics and Playwright Versions

This guide explains how to update the `@elastic/synthetics` package and its associated Playwright dependencies in the synthetics-recorder project.

## Background

This project uses a custom fork of Playwright maintained at [elastic/playwright](https://github.com/elastic/playwright). The fork includes additional patches required for the recorder functionality. When updating `@elastic/synthetics`, you must also update the Playwright packages to matching versions.

## Prerequisites

- Access to the [elastic/playwright](https://github.com/elastic/playwright) repository
- Access to the [elastic/synthetics](https://github.com/elastic/synthetics) repository
- Git configured with appropriate permissions to push to elastic/playwright
- Set up the upstream remote for Microsoft Playwright:

  ```bash
  git remote add upstream git@github.com:microsoft/playwright.git
  ```

## Update Process

> **Note:** The examples in this guide use `${CURRENT_VERSION}` and `${TARGET_VERSION}` as placeholders. Replace these with your actual current and target versions (e.g., `1.56.1` and `1.57.1`).

### Step 1: Identify the Required Playwright Version

Check which Playwright version is used by the target `@elastic/synthetics` version:

1. Go to the [elastic/synthetics](https://github.com/elastic/synthetics) repository
2. Find the version you want to update to (e.g., `1.22.0`)
3. Check the `package.json` to identify the `playwright`, `playwright-core`, and `playwright-chromium` versions

### Step 2: Create the New Playwright Branch

In the [elastic/playwright](https://github.com/elastic/playwright) fork:

1. Checkout the corresponding Microsoft Playwright release tag

   ```bash
   git fetch upstream
   git checkout v${TARGET_VERSION}
   ```

2. Create a new branch following the naming convention `{version}-recorder`

   ```bash
   git checkout -b ${TARGET_VERSION}-recorder
   ```

### Step 3: Cherry-pick the Recorder Patches

The elastic/playwright fork contains custom commits on top of the Microsoft release. You need to apply these patches to the new branch:

1. Find the current recorder branch being used (check `package.json` in synthetics-recorder). In this example, the current branch is `${CURRENT_VERSION}-recorder`.
2. Identify the extra commits on that branch (commits after the Microsoft `v${CURRENT_VERSION}` release tag). For example:

   ```bash
   git log elastic/${CURRENT_VERSION}-recorder
   ```

   Example output:

   ```
   commit 876d6288... (elastic/${CURRENT_VERSION}-recorder)
   Author: ...
   Date:   ...

       feat(packages): push packages                <-- second commit

   commit 9a9860ab...
   Author: ...
   Date:   ...

       feat(recorder): modify and export recorder   <-- first commit
   ```

3. Cherry-pick the **first** patch commit and resolve any conflicts

   ```bash
   git cherry-pick <first-commit-sha>
   # Resolve conflicts if any
   git add .
   git cherry-pick --continue
   ```

4. Cherry-pick the **second** patch commit (this typically includes the packaging script)

   ```bash
   git cherry-pick <second-commit-sha>
   ```

### Step 4: Build and Publish the Tarballs

After cherry-picking the commits:

1. Run the packaging script to create the tarballs

   ```bash
   ./pack_packages.sh
   ```

2. Amend the commit with the new tarballs and push to the remote branch

   ```bash
   git add .
   git commit --amend --no-edit
   git push origin ${TARGET_VERSION}-recorder
   ```

### Step 5: Update synthetics-recorder

Update `package.json` in this project:

1. Update the `@elastic/synthetics` version:

   ```json
   "@elastic/synthetics": "=1.22.0"
   ```

2. Update the Playwright package URLs to point to the new branch:

   ```json
   "playwright": "https://github.com/elastic/playwright/raw/${TARGET_VERSION}-recorder/playwright.tgz",
   "playwright-chromium": "https://github.com/elastic/playwright/raw/${TARGET_VERSION}-recorder/playwright-chromium.tgz",
   "playwright-core": "https://github.com/elastic/playwright/raw/${TARGET_VERSION}-recorder/playwright-core.tgz"
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Run tests locally to verify everything works:

   ```bash
   # Unit tests
   npm run test:unit

   # E2E tests (run in separate terminals)
   npm run test:e2e:server   # Terminal 1: starts the test server
   npm run test:e2e:runner   # Terminal 2: runs the E2E tests
   ```

### Step 6: Open a Pull Request

1. Commit your changes and push to a new branch
2. Open a PR to merge the changes into the main branch
3. The CI pipeline will run automatically to verify all tests pass
4. Once the pipeline is green and the PR is approved, merge the changes
