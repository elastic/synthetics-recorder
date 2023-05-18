#!/usr/bin/env bash
set -eox pipefail

if ! gh --version &>/dev/null ; then
  ## install gh
  wget -q https://github.com/cli/cli/releases/download/v2.4.0/gh_2.4.0_macOS_amd64.tar.gz -O gh.tar.gz
  tar -xpf gh.tar.gz --strip-components=2
  PATH="$(pwd):${PATH}"
  export PATH
  gh --version
fi

gh release \
  create \
  "${TAG_NAME}" \
  --draft \
  --title "${TAG_NAME}" \
  --repo "elastic/${REPO}" \
  "${DIST_LOCATION}"/*.*
