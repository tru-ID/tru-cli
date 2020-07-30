#!/bin/bash
BASEDIR=$(dirname "$0")
export $(cat ./$BASEDIR/../.env | xargs)
$BASEDIR/../node_modules/.bin/oclif-dev publish