#!/bin/bash
#set -xeuo pipefail
#IFS=$'\n\t'

set -x

echo "Deploy backend"
cd backend
python3 -m venv venv
set +x
source venv/bin/activate
set -x
pip install -r requirements.txt
set +x
deactivate
set -x
cd ..

echo "Build and deploy frontend"
cd sorcerer_react
npm install
npm run build
sudo mkdir -p /var/www/sorcerer
sudo rm -r /var/www/sorcerer
sudo cp -r build/ /var/www/sorcerer/
sudo rm -i /etc/nginx/conf.d/default.conf
cd ..
sudo cp deployment/sorcerer.conf /etc/nginx/conf.d/
