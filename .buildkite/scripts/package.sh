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
npm run release-ci