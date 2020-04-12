#!/bin/bash
#set -xeuo pipefail
#IFS=$'\n\t'

set -x

echo "Stopping servers"
sudo service nginx stop
killall flask

echo "Starting servers"
cd backend
set +x
source venv/bin/activate
set -x
#gunicorn -w 2 -D --bind :8042 app:app
flask run -p 8042 &
set +x
deactivate
set -x
cd ..

sudo service nginx start
