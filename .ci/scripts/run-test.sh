#!/bin/bash

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

source $NVM_DIR/nvm.sh
cd $DOCKER_BASE_DIR
nvm use
npm test
