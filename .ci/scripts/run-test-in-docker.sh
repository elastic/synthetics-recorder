#!/usr/bin/env bash
set -eox pipefail

TAG=${BRANCH_NAME:-'latest'}

DOCKER_IMAGE=docker.elastic.co/observability-ci/synthetics-recorder:$TAG
if [[ "$(docker images -q $DOCKER_IMAGE 2> /dev/null)" == "" ]]; then
  docker pull $DOCKER_IMAGE
fi

docker run \
  --rm \
  -u '0:0' \
  -v "$(pwd):/synthetics-recorder" \
  $DOCKER_IMAGE \
  .ci/scripts/run-test.sh
