#!/usr/bin/env bash
set -eox pipefail

docker \
  push \
  docker.elastic.co/observability-ci/synthetics-recorder:latest
