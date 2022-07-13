#!/bin/bash

set -e

if [ -z "$1" ] || [ -z "$2" ]
then
    echo "required arguments are missing"
    exit 1
fi

PROJECT_NAME=$1
DOCKER_TAG=$2

echo "[$0][$PROJECT_NAME] copying docker-compose and init-letsencrypt.sh files..."
scp  apps/ui/infraestructure/docker/docker-compose.yml \
    apps/ui/infraestructure/scripts/init-letsencrypt.sh \
    $SSH_UI_USER@$SSH_UI_HOST:/home/$SSH_UI_USER

echo "[$0][$PROJECT_NAME] starting containers"

ssh $SSH_UI_USER@$SSH_UI_HOST "bash -s" < apps/ui/infraestructure/scripts/docker-compose.sh $UI_DOMAIN $UI_SSL_EMAIL $DOCKER_TAG

echo "[$0][$PROJECT_NAME] remote docker container updated!"