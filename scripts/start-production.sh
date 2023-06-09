#!/bin/bash

SEARCH_DIR="./dist/apps/"
SERVICE_NAME=$1

# Check if SERVICE_NAME is empty and exit the script with an error message if necessary
if [ -z "$SERVICE_NAME" ]; then
  echo "Error: SERVICE_NAME argument is missing"
  exit 1
fi

# Loop through each folder in the directory
for DIR in "$SEARCH_DIR"* ; do
    # Check if the path is a directory
    if [ -d "${DIR}" ] && [ "${DIR##*/}" = "$SERVICE_NAME" ]; then
        DIR_NAME=$(basename "${DIR}")
        echo "Found ${DIR}, running production '${DIR_NAME}' services..."
        echo "node ${SEARCH_DIR}${DIR_NAME}/main.js"
        node "${SEARCH_DIR}${DIR_NAME}/main.js"
    fi
done

echo "Can't run production '${SERVICE_NAME}' services"