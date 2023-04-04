#!/usr/bin/env bash
set -eox pipefail

DIST_LOCATION=$1

ls -l "${DIST_LOCATION}"/*.* || true

echo "Publish artifacts to S3"
cd "${DIST_LOCATION}"
docker run \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -v "$(pwd)":/root \
  docker.elastic.co/infra/aws-cli:latest \
    aws s3 cp ./*.* s3://download.elasticsearch.org/synthetics-recorder/

echo "List artifacts from S3"
docker run \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  docker.elastic.co/infra/aws-cli:latest \
    aws s3 ls s3://download.elasticsearch.org/synthetics-recorder/
