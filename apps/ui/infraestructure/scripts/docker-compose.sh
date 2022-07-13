#!/bin/bash

if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]
then
    echo "required arguments are missing"
    exit 1
fi

UI_DOMAIN=$1
UI_SSL_EMAIL=$2
DOCKER_TAG=$3

echo "creating .env file"
echo "DOCKER_TAG=$DOCKER_TAG" > .env
echo "UI_DOMAIN=$UI_DOMAIN" >> .env
echo "UI_SSL_EMAIL=$UI_EMAIL" >> .env

echo 'Docker compose down'
docker-compose down

echo 'Deleting previous docker image'
docker rmi $(docker images | grep "rodrigomartinezd/can-i-test-ui" | awk '{print $3}') 2>&1 > /dev/null

echo 'Docker compose pull'
docker-compose pull

echo 'Getting dummy SSL certificate to initialize nginx'
bash ./init-letsencrypt.sh 2>&1

echo 'Starting containers...'
docker-compose up -d --force-recreate
echo 'Containers started'

echo 'Deleting stopped containers...'
 docker rm $(docker ps --filter status=exited -q)
echo 'Stopped containers deleted'

echo 'Deleting <none> images...'
docker rmi $(docker images --filter "dangling=true" -q)
echo 'Old docker images deleted'