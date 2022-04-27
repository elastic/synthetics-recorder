#!/usr/bin/env bash
set -eox pipefail

DOCKER_IMAGE=docker.elastic.co/observability-ci/synthetics-recorder:latest
if [[ "$(docker images -q $DOCKER_IMAGE 2> /dev/null)" == "" ]]; then
  docker pull $DOCKER_IMAGE
fi

docker run \
  --rm \
  -ti \
  -u '0:0' \
  -w "/synthetics-recorder" \
  $DOCKER_IMAGE \
  .ci/scripts/run-test.sh
