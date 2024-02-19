#!/usr/bin/env bash
set -eox pipefail

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install "$(cat .nvmrc)"

npm ci

# Disable signing
# see https://www.electron.build/code-signing#how-to-disable-code-signing-during-the-build-process-on-macos
export CSC_IDENTITY_AUTO_DISCOVERY=false
# Disable notarize, see scripts/notarize.js
export SKIP_NOTARIZATION=true
npm run release-ci

# Store unsigned artifacts
if [ -n "$BUILDKITE" ] ; then
    mv dist artifacts-to-sign
    # (only *nix)
    # This is the contract with the unified-release-gpg-signing pipeline
    buildkite-agent artifact upload "artifacts-to-sign/*.deb;artifacts-to-sign/*.dmg;artifacts-to-sign/*.zip"

    mv artifacts-to-sign win-artifacts-to-sign
    # (only windows)
    # TODO: need to clarify the contract.
    buildkite-agent artifact upload "win-artifacts-to-sign/*.exe"

    mv win-artifacts-to-sign mac-artifacts-to-sign
    # (only mac)
    # TODO: need to clarify the contract.
    buildkite-agent artifact upload "mac-artifacts-to-sign/*.dmg"
fi
