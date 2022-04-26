#!/bin/bash

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

echo $UID
echo $GID
echo $USER
echo $USERNAME

source $NVM_DIR/nvm.sh
cd $DOCKER_BASE_DIR
nvm use
NPM_CONFIG_LOGLEVEL=verbose npm test
ls -ltra .
