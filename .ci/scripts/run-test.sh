#!/usr/bin/env bash
set -eo pipefail

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

set -x

ls -ltra

# If NPM_COMMAND then run it.
if [ -n "${NPM_COMMAND}" ] ; then
  npm ${NPM_COMMAND}
fi
NPM_CONFIG_LOGLEVEL=verbose npm run test
