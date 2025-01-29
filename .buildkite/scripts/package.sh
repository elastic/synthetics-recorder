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
# export CSC_IDENTITY_AUTO_DISCOVERY=false
# Disable notarize, see scripts/notarize.js
export SKIP_NOTARIZATION=true

if [ -z "$PACKAGE_PLATFORM" ]; then
  echo "Error: PACKAGE_PLATFORM must be set to continue."
  exit 1
fi

case "$PACKAGE_PLATFORM" in
  "linux")
    echo "--- Package for Linux"
      npm run release-ci_linux-x64 | tee package.log
    ;;

  "macos_arm64")
    echo "--- Package for MacOS ARM64"
      npm run release-ci_mac-arm64 | tee package.log
    ;;

  "macos_x64")
    echo "--- Package for MacOS x64"
      npm run release-ci_mac-x64 | tee package.log
    ;;

  "windows")
    echo "--- Package for Windows"
      npm run release-ci_windows-x64 | tee package.log
    ;;
esac

# Store unsigned artifacts
if [ -n "$BUILDKITE" ] ; then
    echo "--- Upload artifacts"
    mv dist artifacts-to-sign
    # We cannot upload artifacts-to-sign/*.* since it contains some generated files builder-debug, .blockmap and so on
    # (only *nix)
    buildkite-agent artifact upload "artifacts-to-sign/*.deb;artifacts-to-sign/*.dmg;artifacts-to-sign/*.zip"

    # (only windows)
    buildkite-agent artifact upload "artifacts-to-sign/*.exe"

    # (only mac)
    buildkite-agent artifact upload "artifacts-to-sign/*.dmg"
fi
