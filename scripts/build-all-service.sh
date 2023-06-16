#!/bin/bash

# Loop through each folder in the directory
for DIR in ./apps/* ; do
    # Check if the path is a directory
    if [ -d "${DIR}" ]; then
        DIR_NAME=$(basename "${DIR}")
        echo "Found ${DIR}, building '${DIR_NAME}' services..."
        yarn build "${DIR_NAME}"
    fi
done