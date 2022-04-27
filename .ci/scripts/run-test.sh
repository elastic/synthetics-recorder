#!/bin/bash

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

echo $UID
echo $GID
echo $USER
echo $USERNAME

source $NVM_DIR/nvm.sh
nvm use
## Let's use install rather than ci to help with a faster execution
npm install
NPM_CONFIG_LOGLEVEL=verbose npm test
