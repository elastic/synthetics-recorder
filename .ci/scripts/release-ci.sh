#!/usr/bin/env bash

set -eo pipefail

echo 'debug'
security list-keychains || true
security list-keychains -d user || true
security list-keychains -d system || true
security list-keychains -d common || true
security list-keychains -d dynamic || true


echo 'set keychain for the user'
security list-keychains -d user -s /var/lib/jenkins/Library/Keychains/Elastic.keychain-db || true
security list-keychains || true
CSC_KEYCHAIN="/var/lib/jenkins/Library/Keychains/Elastic.keychain-db"
export CSC_KEYCHAIN

echo 'set keychain'
set -x
security list-keychains -s "$CSC_KEYCHAIN"
security default-keychain -s "$CSC_KEYCHAIN"
security list-keychains
security find-identity -v "$CSC_KEYCHAIN"

set +x
echo 'unblock keychain'
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$CSC_KEYCHAIN"

set -x
echo 'test keychain'
security list-keychains
security find-identity -v
security add-generic-password -U -a test-jenkins -s test-jenkins -w test-jenkins "$CSC_KEYCHAIN"
security find-generic-password -a test-jenkins -s test-jenkins -w "$CSC_KEYCHAIN"

echo 'run release-ci'
npm ci
npm run release-ci
