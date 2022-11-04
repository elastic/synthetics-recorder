#!/usr/bin/env bash
set -eo pipefail

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

set -x

# For debugging purposes
whoami
pwd
echo $HOME
ls -ltra $HOME

# If NPM_COMMAND then run it.
if [ -n "${NPM_COMMAND}" ] ; then
  # for some reason this folder got permission denied when
  # running on the CI workers Installation error: EACCES: permission denied
  mkdir -p $HOME/.npm || true
  npm ${NPM_COMMAND}
fi
NPM_CONFIG_LOGLEVEL=verbose npm run test
