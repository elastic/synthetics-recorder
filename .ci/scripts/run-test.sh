#!/usr/bin/env bash
set -eo pipefail

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

set -x

# If NPM_COMMAND then run it.
if [ -n "${NPM_COMMAND}" ] ; then
  # Fix [Error: EACCES: permission denied, mkdir '/synthetics-recorder/node_modules']
  npm config set prefix --global $HOME/node_modules
  npm ${NPM_COMMAND}
fi
NPM_CONFIG_LOGLEVEL=verbose npm run test
