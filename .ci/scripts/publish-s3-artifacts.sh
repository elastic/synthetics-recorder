#!/usr/bin/env bash
set -eo pipefail

DIST_LOCATION=$1
DOCKER_IMAGE=docker.elastic.co/infra/aws-cli:latest
S3_PATH=s3://download.elasticsearch.org/synthetics-recorder/

echo "> List artifacts in the dist folder ($DIST_LOCATION)"
ls -l "${DIST_LOCATION}"/*.* || true

echo "Fetch docker image"
docker pull $DOCKER_IMAGE --quiet

echo "> Publish artifacts to S3"
cd "${DIST_LOCATION}"
for artifact in ./*; do
  echo ">> publishing $artifact ..."
  docker run \
    -e AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY \
    -v "$(pwd)":/root \
    $DOCKER_IMAGE \
    aws s3 cp /root/"$artifact" $S3_PATH
done

echo "> List artifacts from S3"
docker run \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  $DOCKER_IMAGE \
  aws s3 ls $S3_PATH
