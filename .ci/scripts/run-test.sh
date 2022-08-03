#!/usr/bin/env bash
set -eo pipefail

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

set -x
echo $UID
echo $GID
echo $USER
echo $USERNAME
source $NVM_DIR/nvm.sh
nvm install
nvm use
# If NPM_COMMAND then run it.
if [ -n "${NPM_COMMAND}" ] ; then
  npm ${NPM_COMMAND}
fi
echo $PATH
which node
ls -al /root/versions/node/v16.15.0/bin
ls -al /root/versions/node
/usr/bin/env > ~/.env
echo whoami1
whoami
echo whoami2
ls -al /synthetics-recorder/node_modules/.bin
#NPM_CONFIG_LOGLEVEL=verbose npm run test:unit
echo system path
env
echo end system path
echo npm path
NPM_CONFIG_LOGLEVEL=verbose npm run env
echo end npm path
