#!/usr/bin/env bash
set -eo pipefail

echo "> List artifacts from S3"
docker run \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  docker.elastic.co/infra/aws-cli:latest \
    aws s3 ls s3://download.elasticsearch.org/synthetics-recorder/
