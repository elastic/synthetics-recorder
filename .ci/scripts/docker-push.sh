#!/usr/bin/env bash
set -eox pipefail

TAG='latest'

docker \
  push \
  docker.elastic.co/observability-ci/synthetics-recorder:$TAG
