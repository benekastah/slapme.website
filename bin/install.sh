#!/bin/bash
sudo docker build . -t slapme:latest
CONTAINER_ID="$(sudo docker container create -p 80:80 slapme:latest)"
sudo docker start "$CONTAINER_ID"
