#!/bin/bash

# This is the base script used in your remote server
# DO NOT DELETE, IT'S JUST A REFERENCE, THE REAL ONE IS ON THE SERVER

# Receives two arguments: image tag and max retry attempts
# Pull from Docker Hub the image with the given tag
# Stop current container and run another one in port 80 and name it "can-i-test-ui"
# Loop until max attempts or finding the container is up and running

if [[ -z "$1"  ||  -z "$2" || -z "$3" ]]
then
    echo "required arguments are missing"
    return
fi

SCRIPT_NAME=$0
IMAGE_TAG=$1
MAX_ATTEMPTS=$2
PROJECT_NAME=$3
IMAGE_ID="rodrigomartinezd/can-i-test-$PROJECT_NAME:$IMAGE_TAG"

function log () {
    echo "[$SCRIPT_NAME][$PROJECT_NAME] $1"
}

log "deleting previous container..."

docker stop "can-i-test-$PROJECT_NAME"  > /dev/null 2>&1
docker rm "can-i-test-$PROJECT_NAME"  > /dev/null 2>&1

log "deleting all previous docker images..."

docker rmi $(docker images | grep "rodrigomartinezd/can-i-test-$PROJECT_NAME" | awk '{print $3}') > /dev/null

log "pulling $IMAGE_ID docker image"
 
docker pull $IMAGE_ID

log "starting docker container: can-i-test-$PROJECT_NAME with $IMAGE_ID image"
docker run --rm -d \
    -p 80:80 \
    --name "can-i-test-$PROJECT_NAME" \
    $IMAGE_ID

attempt=0
while [[ $attempt < $MAX_ATTEMPTS ]]; do
    if [[ $(docker inspect -f {{.State.Running}} can-i-test-$PROJECT_NAME) == "true" ]]; then
        log "container up and running..."
        exit 0
    fi
    log "waiting for can-i-test-$PROJECT_NAME container..."
    sleep 1
    attempt=$(( $attempt + 1))
    log $attempt
done
log "couldn't start the docker container. Something went wrong."
exit 1