#!/usr/bin/env bash
set -eox pipefail

TAG=${BRANCH_NAME:-'latest'}

docker \
  push \
  docker.elastic.co/observability-ci/synthetics-recorder:$TAG
