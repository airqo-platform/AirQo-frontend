#!/bin/bash

# Import the functions we need
source "bin/functions/general.sh"

setNodePath() {

    if [[ -z "${NODE_PATH_SET}" ]];
    then
        log  "Setting Node path"
        export PATH="${PATH}:$(pwd)/node_modules/.bin"
        export NODE_PATH_SET=True
    else
        log  "Node path set: ${PATH}"
    fi
}
