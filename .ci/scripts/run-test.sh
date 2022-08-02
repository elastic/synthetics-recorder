#!/usr/bin/env bash
set -eo pipefail

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

echo $UID
echo $GID
echo $USER
echo $USERNAME
source $NVM_DIR/nvm.sh
nvm install
nvm use
set -x
# If NPM_COMMAND then run it.
if [ -n "${NPM_COMMAND}" ] ; then
  npm ${NPM_COMMAND}
fi
#ls -al /root/versions/node/v16.15.0/bin
NPM_CONFIG_LOGLEVEL=verbose npm run test:unit
