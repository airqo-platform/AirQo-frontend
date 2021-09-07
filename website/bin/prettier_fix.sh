#!/bin/sh
set -e

files="$@"
if [ -z "$files" ]; then
    files='frontend/**/*.{js,jsx,css,less,sass,ts,tsx}'
    eslint --fix "./frontend/**/*.{,js,jsx}"
fi


prettier --write "$files"
