#!/usr/bin/env bash
set -eox pipefail

TAG='latest'

DOCKER_IMAGE=docker.elastic.co/observability-ci/synthetics-recorder:$TAG
if [[ "$(docker images -q $DOCKER_IMAGE 2> /dev/null)" == "" ]]; then
  if ! docker pull $DOCKER_IMAGE ; then
    # pull the docker image from the target branch
    DOCKER_IMAGE=docker.elastic.co/observability-ci/synthetics-recorder:$CHANGE_TARGET
    docker pull $DOCKER_IMAGE
  fi
fi

DOCKER_RUN_OPTIONS="-i --rm"

# Only allocate tty if we detect one
if [ -t 0 ] && [ -t 1 ]; then
    DOCKER_RUN_OPTIONS="$DOCKER_RUN_OPTIONS -t"
fi

docker run \
  $DOCKER_RUN_OPTIONS \
  -u '0:0' \
  -v "$(pwd):/synthetics-recorder" \
  $DOCKER_IMAGE \
  .ci/scripts/run-test.sh
