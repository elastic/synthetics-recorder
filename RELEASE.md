### Releasing

**NOTE: This project is currently in Alpha phase**

#### Manually

Generate a Github token which is required to create a release in the Github,
the process is as follows:

1. Be sure you have checked out the `main` branch and have pulled the latest changes
1. Run the tests to make sure everything is green
1. Bump the alpha version by running `npm version prerelease --preid=alpha`
1. Run the release command using `GH_TOKEN=<token> npm run release`
1. If release is successful, push commits and tags upstream with
   `git push upstream main && git push upstream --tags`
