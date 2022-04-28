#!/usr/bin/env bash
set -eox pipefail

TAG=${BRANCH_NAME:-'latest'}

docker \
  build \
  --file e2e/Dockerfile.jenkins \
  --build-arg DISPLAY=":99" \
  --tag docker.elastic.co/observability-ci/synthetics-recorder:$TAG .
