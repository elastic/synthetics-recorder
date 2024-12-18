#!/usr/bin/env bash
# Download the signed artifacts and run the GitHub release using the GH cli
#
# Required environment variables:
#  - BUILDKITE_TAG
#
set -eox pipefail

DIST_LOCATION=signed-artifacts
echo "--- Download signed artifacts"
buildkite-agent artifact download --step gpg "$DIST_LOCATION/*.*" ./
buildkite-agent artifact download --step macos "$DIST_LOCATION/*.*" ./
buildkite-agent artifact download --step windows "$DIST_LOCATION/*.*" ./

echo "--- List signed artifacts"
ls -l "$DIST_LOCATION/"

echo "--- Install gh :github:"
if ! gh --version &>/dev/null ; then
  wget -q https://github.com/cli/cli/releases/download/v2.50.0/gh_2.50.0_linux_amd64.tar.gz -O gh.tar.gz
  tar -xpf gh.tar.gz --strip-components=2
  PATH="$(pwd):${PATH}"
  export PATH
  gh --version
fi

echo "--- Run GitHub release"
if [ -n "${BUILDKITE_TAG}" ] ; then

  if [ ! -d "$DIST_LOCATION" ] ; then
    echo "No signed artifacts found in ${DIST_LOCATION}"
    exit 1
  fi

  # VAULT_GITHUB_TOKEN is the GitHub ephemeral token created in Buildkite
  GH_TOKEN=$VAULT_GITHUB_TOKEN \
  gh release \
    create \
    "${BUILDKITE_TAG}" \
    --draft \
    --title "${BUILDKITE_TAG}" \
    --repo elastic/synthetics-recorder \
    ./$DIST_LOCATION/*.*
else
  echo "gh release won't be triggered this is not a Git tag release, but let's list the releases"
  # VAULT_GITHUB_TOKEN is the GitHub ephemeral token created in Buildkite
  GH_TOKEN=$VAULT_GITHUB_TOKEN \
  gh release list --repo elastic/synthetics-recorder
fi
