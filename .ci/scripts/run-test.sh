#!/usr/bin/env bash
set -eo pipefail

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

echo $UID
echo $GID
echo $USER
echo $USERNAME

set -x
# If NPM_COMMAND then run it.
if [ -n "${NPM_COMMAND}" ] ; then
  # Change the path otherwise it will fail in docker as it tries to
  # to use /root/.npm
  mkdir -p /synthetics-recorder/.npm || true
  npm config --global set prefix /synthetics-recorder/.npm
  npm ${NPM_COMMAND}
fi
NPM_CONFIG_LOGLEVEL=verbose npm run test
