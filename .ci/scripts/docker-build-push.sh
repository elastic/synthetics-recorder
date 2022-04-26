#!/usr/bin/env bash
set -eox pipefail

docker \
  build \
  --file e2e/Dockerfile.jenkins \
  --build-arg BASE_DIR="." \
  --build-arg DOCKER_BASE_DIR="/synthetics-recorder" \
  --build-arg DISPLAY=":99" .
