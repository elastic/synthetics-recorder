#!/usr/bin/env bash
set -eox pipefail

ls -l ${DIST_FOLDER}/*.* || true
gh release \
  create \
  "${TAG_NAME}" \
  --draft \
  --title "${TAG_NAME}" \
  --repo v1v/${REPO} \
  ${DIST_FOLDER}/*.*
