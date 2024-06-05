#!/usr/bin/env bash
# Download the signed artifacts and run the GitHub release using the GH cli
#
# Required environment variables:
#  - BUILDKITE_TAG
#
set -eox pipefail

DIST_LOCATION=artifacts-to-upload

echo "--- Download signed artifacts"
mkdir -p "$DIST_LOCATION"
buildkite-agent artifact download --step gpg "signed-artifacts/*.*" "$DIST_LOCATION"/
buildkite-agent artifact download --step macos "signed-artifacts/*.*" "$DIST_LOCATION"/
buildkite-agent artifact download --step windows "signed-artifacts/*.*" "$DIST_LOCATION"/
ls -l "$DIST_LOCATION"/

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
  gh release \
    create \
    "${BUILDKITE_TAG}" \
    --draft \
    --title "${BUILDKITE_TAG}" \
    --repo elastic/synthetics-recorder \
    "${DIST_LOCATION}/*.*"
else
  echo "gh release won't be triggered this is not a Git tag release"
fi
