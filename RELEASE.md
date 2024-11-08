### Releasing

The release process is automated. Any specific commit from the main branch can be potentially released. Follow the steps below to create a release:

Be sure you have checked out the `main` branch and have pulled the latest changes

```bash
  git checkout main
  git pull upstream main
```

#### Ensure package-lock.json is clean

```bash
# package-lock.json file should have no unstaged changes
npm install
```

#### Run tests

Ensure the tests pass for you locally.

```bash
npm test
```

#### Bump the project version

```bash
  npm version minor
```

#### Push commits and tags upstream

```bash
  # update code
  git push upstream main

  # new tag will trigger a release build
  git push upstream --tags
```

This will start the release process. Wait for an email/slack to confirm the
release is done. You can track the progress of the release job in [Buildkite](https://buildkite.com/elastic/synthetics-recorder-release/).

### Criteria for publishing

#### Manual testing

Before publishing a release there are a few basic criteria.
In order to generate a release binary, the build pipeline will have already run all tests and successfully signed
the artifacts for macOS, Windows, and Linux.

Thus, the only real confirmation step required is to run the actual release binaries before publishing.
As of now, this is a rather informal process where we solicit help from team members who run on each platform.
It would be a much nicer process in future releases to ensure we have an easy-access, centralized way for anyone
on the team that maintains the Recorder to quickly download and run the binaries.

Once someone has ensured that the following are true, there's nothing blocking the new version from release.

1. The Recorder loads without warning the user that the code is unsigned/dangerous.
1. The Recorder app opens.
1. You are able to record a session.
1. You are able to use the Test feature and see Playwright replicate your journey.
   - **Note:** the Recorder is a basic tool, and is not capable of fully mapping all arbitrary browser sessions.
     It is easy to make a path that causes it to record code that may not run perfectly.
     An all-encompassing recording feature set is not currently within the design goals of this app.
     A single broken journey not necessarily disqualify the release, we should take note of things
     that break the recorder and try to address them in the future.
1. You are able to export code.
1. Ideally, you take the code you export and run it in an actual monitor in a Kibana or Project.

- **Note:** if you use this in Kibana's Synthetics UI you must export as an `inline` script.
