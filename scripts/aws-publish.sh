#!/bin/bash
BASEDIR=$(dirname "$0")
ENV_FILE=./$BASEDIR/../.env
if test -f "$ENV_FILE"; then
    echo "Loading Environment Variables from .env"
    export $(cat  | xargs)
fi

$BASEDIR/../node_modules/.bin/oclif-dev publish
