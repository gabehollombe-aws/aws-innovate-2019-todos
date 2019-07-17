#!/bin/bash
# This script requires the jq CLI utility to be installed

set -x
set -e

LOAD_TESTER_FUNCTION_NAME=$(jq -r '.function | keys[0]' amplify/backend/backend-config.json)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

# Install lambda function dependencies
LOAD_TESTER_SRC_DIR="../amplify/backend/function/$LOAD_TESTER_FUNCTION_NAME/src"
pushd $LOAD_TESTER_SRC_DIR
npm install
popd

# Copy our end-to-end test page objects to our lambda function
cp -R ../src/tests/pages $LOAD_TESTER_SRC_DIR

# Deploy with amplify
pushd ..
amplify function push