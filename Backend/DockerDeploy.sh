#!/bin/bash

echo What should the version be?
read VERSION

docker build -t sidm9/lireddit:$VERSION .
docker push sidm9/lireddit:$VERSION