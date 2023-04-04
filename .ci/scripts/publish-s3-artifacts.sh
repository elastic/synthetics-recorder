#!/usr/bin/env bash
set -eox pipefail

DIST_LOCATION=$1

ls -l "${DIST_LOCATION}"/*.* || true

cd "${DIST_LOCATION}"
docker run \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -v "$(pwd)":/root \
  docker.elastic.co/infra/aws-cli:latest \
    aws s3 cp ./*.* s3://download.elasticsearch.org/synthetics-recorder/
