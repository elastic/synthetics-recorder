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

When updating the version of [@elastic/synthetics](https://github.com/elastic/synthetics)(called _Synthetics agent_ hereafter), it is important to align the version of Playwright that the Synthetics agent uses and the forked Playwright that is installed by the recorder.

##### Summary

You are going to create a custom version of the released version of Playwright. A condensed explanation of this process follows:

1. Pull latest Playwright changes from Microsoft -> Elastic fork.
1. Rebase the `synthetics-recorder` branch off of latest main and resolve conflicts.
1. Identify the Playwright version(s) we will need to build.
1. Spawn custom branch(es) off of the release tag(s) for the version(s) used by the target version of Synthetics
1. `git cherry-pick` our custom commit off of the `synthetics-recorder` branch into the branches you created from Playwright release tags.
1. Build Playwright and commit the updated src and lib files, push to Elastic remote.
1. Update the dependencies in the Recorder's `package.json` to reference the branch(es) you have pushed.
1. Build the Recorder and test to make sure the browsers are working and you can export generated code.

##### Detailed steps

1. Go to [@elastic/playwright](https://github.com/elastic/playwright), fetch upstream microsoft:main into main if needed. We keep our modifications in `synthetics-recorder` branch. It is supposed to have only one extra commit[(84309bf)](https://github.com/elastic/playwright/commit/84309bf44d2a97889b178f2f2da2bc9f30e5aff8)) compared to the main branch. If main branch has new commits, fetch the changes into `synthetics-recorder` branch by pulling it with [rebase](https://git-scm.com/docs/git-pull#Documentation/git-pull.txt---rebasefalsetruemergesinteractive) option

2. Pull the remote changes to your machine. If necessary, set the remote as follows:

```bash
git remote add upstream https://github.com/microsoft/playwright.git
git remote add elastic https://github.com/elastic/playwright.git
git remote -v
// prints:
// upstream	https://github.com/microsoft/playwright.git (fetch)
// upstream	https://github.com/microsoft/playwright.git (push)
// elastic  https://github.com/elastic/playwright.git (fetch)
// elastic  https://github.com/elastic/playwright.git (push)
```

3. The Recorder depends on custom versions of the `playwright` and `playwright-core` packages.
   Confirm the Playwright version from Synthetics agent's `package.json`:

```json
// @elastic/synthetics's package.json
    "playwright": "=1.38.0",
    "playwright-core": "=1.37.1",
```

4. If `playwright` and `playwright-core` are the exact same version, you only need to create one new branch. If these do not match, like in the example shown in step 3 where Synthetics depends on `1.38.0` and `1.38.1`, you'll need to build both of those tags. Without doing this, `@elastic/synthetics` will pull in the vanilla version of the package in question when installed in the Recorder, and the app will break when it runs. Fetch the tags from upstream, checkout to the version, and create a new branch:

```bash
git fetch upstream --tags
git checkout -b 1.38.0-recorder v1.38.0
```

```bash
git checkout -b 1.38.1-recorder v1.38.1
```

5. Cherry-pick the commit from `synthetics-recorder` branch, then run `npm run build`. Make sure you've uncommented [!packages/playwright-core/lib](https://github.com/elastic/playwright/blob/f3441b1d93091725ba929e2ec8dbc70cefc081ef/.gitignore#L14) and `!packages/playwright/lib` in `.gitignore`. This will cause `git` to let us stage all the `lib` files that Playwright will build. Check all the files under `packages/playwright-core/lib` are staged, then commit and push it to elastic remote:

**NOTE:** it is possible you will need to do some additional cleanup, as the `cherry-pick` described below does not always transfer the changes perfectly. You can reference the diff from [this commit](https://github.com/elastic/playwright/commit/d4e68eb0467e9ac9409ca42b55cafbb36d3dc7f3) to the `1.37.0` version bump to see some of the additional changes.

```bash
# example:
git cherry-pick 84309bf
# solve conflicts if necessary
# uncomment `!packages/playwright-core/lib/` in .gitignore (L14)
npm run build
git add .
git commit -m "feat: generate libs"
git push --set-upstream elastic 1.38.0-recorder
```

6. Test new changes in the Recorder by updating Recorder's package.json. Update `playwright` dependency to the branch you pushed from above step:

```json
// @elastic/synthetics-recorder's package.json
...
    "playwright": "https://gitpkg.now.sh/elastic/playwright/packages/playwright-core?1.38.0-recorder",
...
```

##### Javascript Codegen

We generate tailored javascript files for synthetics agent, and we keep that piece of code in the recorder([temporarily](https://github.com/elastic/synthetics-recorder/issues/295)), so this can be outdated even though we've updated the Playwright fork. When we update Playwright, it is also advisable to review the [JavascriptLanguageGenerator](https://github.com/elastic/playwright/blob/main/packages/playwright-core/src/server/recorder/javascript.ts#L28) and update our [codegen code](https://github.com/elastic/synthetics-recorder/blob/main/electron/syntheticsGenerator.ts#L151) inherited the class, especially `generateAction` function that we override.

### Build

Build and Package the app for all platforms

```
npm run pack -- -mwl
```
