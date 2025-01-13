#!/usr/bin/env bash
# Download the signed artifacts and run the GitHub release using the GH cli
#
# Required environment variables:
#  - BUILDKITE_TAG
#
set -eox pipefail

DIST_LOCATION=signed-artifacts
echo "--- Download signed artifacts"
#
# Download the signed artifacts from the previous step but using the below order
# gpg, windows and macos.
# This should help with the signing process and download the files in the correct
# order. gpg signing signs all the files, but the dmg files need to be signed
# separately as part of the Macos BK pipeline helper.
# As long as, the signing process is split in different types and use the same
# folder name, we need this hack.
#
buildkite-agent artifact download --step gpg "$DIST_LOCATION/*.*" ./
# help with debugging
ls -ltra "$DIST_LOCATION/"
buildkite-agent artifact download --step windows "$DIST_LOCATION/*.*" ./
ls -ltra "$DIST_LOCATION/"
buildkite-agent artifact download --step macos "$DIST_LOCATION/*.*" ./
ls -ltra "$DIST_LOCATION/"

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
    --generate-notes \
    --repo "elastic/synthetics-recorder" \
    "${DIST_LOCATION}"/*.*
else
  echo "gh release won't be triggered this is not a Git tag release, but let's list the releases"
  # VAULT_GITHUB_TOKEN is the GitHub ephemeral token created in Buildkite
  GH_TOKEN=$VAULT_GITHUB_TOKEN \
  gh release list --repo elastic/synthetics-recorder
fi
