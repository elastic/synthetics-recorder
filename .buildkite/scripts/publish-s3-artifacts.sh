#!/usr/bin/env bash
#
# Create a dynamic buildkite step to upload the artifacts to the s3 bucket
#

DRY_RUN=true
if [ -n "${BUILDKITE_TAG}" ] ; then
  DRY_RUN=false
fi

cat << EOF
  - label: ":pipeline: publish s3 artifacts"
    trigger: unified-release-publish-s3-artifacts
    build:
      env:
        DESTINATION_PATH: "s3://download.elasticsearch.org/synthetics-recorder/"
        DRY_RUN: $DRY_RUN
EOF
