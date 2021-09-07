#!/bin/bash

# Setup some functions we want to use
function log()
{
    DATE_STR=$(date +"%Y-%m-%dT%H:%M:%S %z")

    echo -e "[${DATE_STR}] $*"
}

function react_to_exit_code()
{
    exit_code=$1

    shift 1

    log_message="$*"

    if [[ ${exit_code} != 0 ]];
    then
        handle_exit 1000 "$log_message"
    fi
}

function handle_exit()
{
    EXIT_CODE=$1

    shift

    if [[ ! -z "$@" ]];
    then
        log "Exiting: $*"
    fi

    exit "${EXIT_CODE}"
}
