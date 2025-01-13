#!/usr/bin/env bash
set -exo pipefail

echo "~~~ Load nvm"
if [ -n "$BUILDKITE" ] ; then
  set +xe
  # Need to figure out what's the reason NVM is not explictly loaded
  source "$HOME/.zshrc"
fi

echo "--- Install node and gather dependencies"
nvm install "$(cat .nvmrc)"
npm ci

echo "--- run release-ci"
# Disable signing
# see https://www.electron.build/code-signing#how-to-disable-code-signing-during-the-build-process-on-macos
export CSC_IDENTITY_AUTO_DISCOVERY=false
# Disable notarize, see scripts/notarize.js
export SKIP_NOTARIZATION=true
npm run release-ci

# Store unsigned artifacts
if [ -n "$BUILDKITE" ] ; then
    echo "--- Upload artifacts"
    mv dist artifacts-to-sign
    buildkite-agent artifact upload "artifacts-to-sign/*.*"
fi
