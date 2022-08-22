## Elastic Synthetics Recorder

### Installation and Usage

#### Download and Install

We publish releases of the Script Recorder on its [GitHub repo](https://github.com/elastic/synthetics-recorder/releases).
You can find downloadable installers there for a variety of platforms.

**Note that the Script Recorder is in a Tech Preview phase at the moment, and not supported.**

Download and unpack the appropriate installer for your platform, and install it.

#### Usage

This section describes the basic usage of the Script Recorder.
It explains how to start a journey and record steps, as well as testing and outputting a completed script.

After starting up the application, you may input a URL.
This URL will be the starting point of the journey script Elastic Synthetics will create.

Once you start a journey, Elastic Synthetics will record actions based on your interaction with the browser window.
This includes clicking on text, navigation, focusing on inputs like buttons and text fields, and more.
As you complete your journey, you will see the actions you are generating populate in the Script Recorder's window.

You can also add assertions to your journey.
Use these to make determinations about the state of the page you are testing.
Assertions can include checks for things like the visibility of an element, or the contents of a text field.

The Script Recorder also includes a Pause feature.
When you pause the recording session, you may click around the browser window without recording any actions.
Un-pause the Recorder to continue recording journey actions.

At any point during or after the recording process concludes, you may test your script.
When you click the `Test` button, Elastic Synthetics will run the journey you have defined.
After the test concludes, the Recorder will display results on a per-step basis.

When you are satisfied with the script you have generated, you can save it to file using the `Export script` button.
Additionally, you can display the generated JavaScript code using the `Show script` feature.

### Develop

**Note:** the recorder is intended to be run against a specific version of `node`/`npm`.
If you use `nvm` to manage your versions, you can simply run `nvm use` to switch to the
appropriate version. If not, you can view the current supported version in the `.nvmrc` file.
You can see potential error outputs as a result of using the incorrect version below in the troubleshooting section.

Install the dependencies

```
npm install
```

Run the recorder app in dev mode.

```
npm run dev
```

#### Managing Playwright dependency

When updating the version of [@elastic/synthetics](https://github.com/elastic/synthetics)(called _Synthetics agent_ hereafter), it is important to align the version of Playwright that the Synthetics agent uses and the forked Playwright that is installed by the recorder. Steps to update the Playwright is as followed:

1. Go to [@elastic/playwright](https://github.com/elastic/playwright), fetch upstream microsoft:main into main if needed. We keep our modifications in `synthetics-recorder` branch. It is supposed to have only one extra commit[(84309bf)](https://github.com/elastic/playwright/commit/84309bf44d2a97889b178f2f2da2bc9f30e5aff8)) compared to the main branch. If main branch has new commits, fetch the changes into `synthetics-recorder` branch by pulling it with [rebase](https://git-scm.com/docs/git-pull#Documentation/git-pull.txt---rebasefalsetruemergesinteractive) option

1. Pull the remote changes to your machine. If necessary, set the remote as follows:

```
git remote add upstream https://github.com/microsoft/playwright.git
git remote add elastic https://github.com/elastic/playwright.git
git remote -v
// prints:
// upstream	https://github.com/microsoft/playwright.git (fetch)
// upstream	https://github.com/microsoft/playwright.git (push)
// elastic  https://github.com/elastic/playwright.git (fetch)
// elastic  https://github.com/elastic/playwright.git (push)
```

2. Confirm the Playwright version from Synthetics agent's `package.json`:

```
// @elastic/synthetics's package.json
...
    "playwright-core": "=1.20.1",
...
```

3. Fetch the tags from upstream, checkout to the version 1.20.1, and create a new branch:

```
git fetch upstream --tags
git checkout -b 1.20.1-recorder v1.20.1
```

4. Cherry-pick the commit from `synthetics-recorder` branch, then run `npm run build`. You should see generated js files under `packages/playwright-core/lib` directory. Commit all the changes and push it to elastic remote:

```
git cherry-pick 84309bf
# solve conflicts if necessary
npm run build
git add .
git push  --set-upstream elastic 1.20.1-recorder
```

5. Test new changes in the Recorder by updating Recorder's package.json. Update `playwright` dependency to the branch you pushed from above step:

```js
// @elastic/synthetics-recorder's package.json
...
    "playwright": "https://gitpkg.now.sh/elastic/playwright/packages/playwright-core?1.20.1-recorder",
...
```

For now, we are doing it all manually, However, we should consider automating the process.

### Build

Build and Package the app for all platforms

```
npm run pack -- -mwl
```
