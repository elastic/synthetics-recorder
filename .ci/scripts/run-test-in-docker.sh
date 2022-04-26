#!/usr/bin/env bash
set -eox pipefail

docker pull docker.elastic.co/observability-ci/synthetics-recorder:latest

docker run \
  --rm \
  -ti \
  -u '0:0' \
  -w "/synthetics-recorder" foo:latest .ci/scripts/run-test.sh
