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

This will start the release process. Wait for an email/slack to confirm the release is done.
