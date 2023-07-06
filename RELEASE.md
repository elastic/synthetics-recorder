### Releasing

The release process is automated. Any specific commit from the main branch can be potentially released. Follow the steps below to create a release:

Be sure you have checked out the `main` branch and have pulled the latest changes

```bash
  git checkout main
  git pull upstream main
```

Bump the beta version

```bash
  npm version prerelease --preid=beta
```

Push commits and tags upstream

```
  git push upstream main && git push upstream --tags
```

This will start the release process. Wait for an email/slack to confirm the release is done.
