#!/usr/bin/env bash
set -eox pipefail

docker \
  build \
  --file e2e/Dockerfile.jenkins \
  --build-arg DISPLAY=":99" \
  --tag docker.elastic.co/observability-ci/synthetics-recorder:latest .

exit 0
docker \
  push \
  docker.elastic.co/observability-ci/synthetics-recorder:latest
