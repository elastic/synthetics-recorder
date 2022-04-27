#!/bin/bash

Xvfb ${DISPLAY} -screen 0 1024x768x16 &

echo $UID
echo $GID
echo $USER
echo $USERNAME

source $NVM_DIR/nvm.sh
dir=$(pwd)
cd $DOCKER_BASE_DIR
nvm use
NPM_CONFIG_LOGLEVEL=verbose npm test

# CI specific requirements
# Copy the junit files to the workspace to be shared with the
# pipeline workspace
cleanup() {
  cd $DOCKER_BASE_DIR
  cp ./*junit.xml "${dir}/"
}

trap cleanup EXIT
