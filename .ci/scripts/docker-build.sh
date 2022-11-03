#!/usr/bin/env bash
set -eox pipefail

TAG=${BRANCH_NAME:-'latest'}

# Read node version from .nvmrc and remove v prefix.
NODE_VERSION=$(cat .nvmrc | sed "s#v##g")

docker \
  build \
  --file e2e/Dockerfile.jenkins \
  --build-arg DISPLAY=":99" \
  --build-arg NODE_VERSION="${NODE_VERSION}" \
  --tag docker.elastic.co/observability-ci/synthetics-recorder:$TAG .
