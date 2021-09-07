#!/bin/bash

# Import the functions we need
source "bin/functions/general.sh"

FILES=""

OPTION=$1

if [[ "${OPTION}" == "--latest" ]];
then
    # We're asking to just do the latest, so we'll do the last 3 commits
    FILES=$(git diff HEAD~3 --diff-filter=ACM --name-only frontend | egrep "\.ts|\.tsx|\.js|\.jsx|\.css|\.less")
elif [[ "${OPTION}" == "--all" ]];
then
    FILES='frontend/**/*.{ts,tsx,js,jsx,css,less}'
else
    # We'll just check all files different than master
    FILES=$(git diff master..HEAD --diff-filter=ACM --name-only frontend | egrep "\.ts|\.tsx|\.js|\.jsx|\.css|\.less")
fi

if [[ "${FILES}" == "" ]];
then
    handle_exit 0 "No files to scan."
fi

while read -r line;
do
    log "Running prettier check on: ${line}"

    prettier --list-different "${line}"

    react_to_exit_code $? "Prettier check failed for ${line}"
done <<< "${FILES}"
