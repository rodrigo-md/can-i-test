#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]
then
    echo "required arguments are missing"
    return
fi

DOCKER_TAG=$1
MAX_ATTEMPTS=$2
PROJECT_NAME=$3

echo "[$0][$PROJECT_NAME] notifying remote server to update docker container with latest image"

ssh $SSH_UI_USER@$SSH_UI_HOST "bash -s" < tools/docker-pull.sh $DOCKER_TAG $MAX_ATTEMPTS $PROJECT_NAME

echo "[$0][$PROJECT_NAME] remote docker container updated!"