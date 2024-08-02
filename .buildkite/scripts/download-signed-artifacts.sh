#!/usr/bin/env bash
#
# Create a dynamic buildkite step with the artifacts to be downloaded
#
# Required environment variables:
#  - BUILDKITE_TOKEN_SECRET
#

STEP=$1
DOWNLOAD_STEP_NAME=$2

## Support main pipeline and downstream pipelines
if [ -n "$BUILDKITE_TRIGGERED_FROM_BUILD_PIPELINE_SLUG" ] ; then
  BUILDKITE_PIPELINE_SLUG=$BUILDKITE_TRIGGERED_FROM_BUILD_PIPELINE_SLUG
  BUILDKITE_BUILD_NUMBER=$BUILDKITE_TRIGGERED_FROM_BUILD_NUMBER
fi

## Fail if no token
if [ -z "$BUILDKITE_TOKEN_SECRET" ] ; then
  echo "Token could not be loaded from vault. Please review .buildkite/hooks/pre-command"
  exit 1
fi

BUILDS_URL="https://api.buildkite.com/v2/organizations/elastic/pipelines/$BUILDKITE_PIPELINE_SLUG/builds"
build_json=$(curl -sH "Authorization: Bearer $BUILDKITE_TOKEN_SECRET" "$BUILDS_URL/$BUILDKITE_BUILD_NUMBER")
# sign-service is the pipeline step in .buildkite/release.yml
SIGN_BUILD_ID=$(jq -r ".jobs[] | select(.step_key == \"$STEP\").triggered_build.id" <<< "$build_json")

## Fail if no build id
if [ -z "$SIGN_BUILD_ID" ] ; then
  echo "Sign build id could not be found. Please review $BUILDS_URL/$BUILDKITE_BUILD_NUMBER and the below json output:"
  echo "$build_json"
  curl -sH "Authorization: Bearer $BUILDKITE_TOKEN_SECRET" "$BUILDS_URL"
  exit 1
fi

cat << EOF
  - label: ":pipeline: Download signed artifacts"
    key: "$DOWNLOAD_STEP_NAME"
    commands:
      - mkdir -p signed-artifacts
      - buildkite-agent artifact download --build "$SIGN_BUILD_ID" "*.*" signed-artifacts/
      - buildkite-agent artifact upload "signed-artifacts/*.*"
    agents:
      image: docker.elastic.co/ci-agent-images/ubuntu-build-essential
EOF