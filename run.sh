#!/bin/bash
#set -xeuo pipefail
#IFS=$'\n\t'

set -x

echo "Stopping servers"
sudo service nginx stop
killall python

echo "Starting servers"
./startup.sh

sudo service nginx start
