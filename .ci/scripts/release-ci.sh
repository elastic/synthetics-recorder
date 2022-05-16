#!/bin/bash --login

set -eo pipefail

echo 'set env context'
export HOME='/var/lib/jenkins'
export CSC_KEYCHAIN="/var/lib/jenkins/Library/Keychains/Elastic.keychain-db"

echo 'set keychain'
set -x
security list-keychains -s "$CSC_KEYCHAIN"
security list-keychains

set +x
echo 'unlock keychain'
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$CSC_KEYCHAIN"

echo 'run release-ci'
set -x
npm ci
npm run release-ci
