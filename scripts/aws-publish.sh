#!/bin/bash
BASEDIR=$(dirname "$0")
echo "BASEDIR $BASEDIR"
ENV_FILE=./$BASEDIR/../.env
if test -f "$ENV_FILE"; then
    echo "Loading Environment Variables from .env"
    export $(cat $ENV_FILE | sed 's/#.*//g' | xargs)
fi

echo "Running oclif-dev publish:macos"
$BASEDIR/../node_modules/.bin/oclif-dev publish:macos
# $BASEDIR/../node_modules/.bin/oclif-dev publish:win
