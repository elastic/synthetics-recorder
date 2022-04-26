#!/usr/bin/env bash
set -eox pipefail

docker build -f e2e/Dockerfile.jenkins \
  --build-arg BASE_DIR="." \
  --build-arg DOCKER_BASE_DIR="${DOCKER_BASE_DIR}" \
  --build-arg DISPLAY="${DISPLAY}" .
