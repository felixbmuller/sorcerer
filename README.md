# sorcerer

This is a broswer game version of the card game Wizard ([Wikipedia article](https://en.wikipedia.org/wiki/Wizard_(card_game))). 
Simply deploy it to a server, share its domain name or IP address and you can play with friends.

![screenshort of the game](https://i.imgur.com/7qsGWjE.png)

There are some open issues, especially concerning (the absolute lack of) responsivness, but it does what it is supposed to do!

## Deployment

The following works fine with a Free Tier AWS Ubuntu instance which is used for nothing else. 
Otherwise please have a look at the scripts before you run them.

1. Install `nginx` according to the instructions for your distribution.
2. Install `python3-dev, python3-pip, python3-venv`
3. Install a recent version of `npm` (problably not in your distros repo, use the website) and make
  sure that the executable is in path
4. Run `bash deploy.sh` in the root directory of this project. 
  This will install dependencies, build the react app and place all files where
  they belong
5. Run `bash run.sh` to start the `nginx` and the backend server. This will stop
  both servers if they are already running.
6. If you see the nginx welcome page, there is a default template somewhere in the nginx
  configuration search path that you need to delete. Look into `/etc/nginx/nginx.conf` to see
  what files it includes.
8. Run `sudo update-rc.d nginx defaults` to enable autostart for nginx. 
   Add `home/ubuntu/sorcerer/startup.sh` to `/etc/rc.local`. If this file does not exist, 
   you can copy the version in `deployment/` to `/etc/`. This enables autostart for flask.
7. To stop the servers, run `killall flask` and `sudo service nginx stop`

Note: This is quite hacky because I need to use the flask development server instead
of gunicorn (thats an open issue).

## Development

### Setup

1. Install `python3-dev, python3-pip, python3-venv`
2. Run `pip install -r requirements.txt` in the `backend` folder
3. Install a recent version of `npm` (problably not in your distros repo, use the website) and make
  sure that the executable is in path
4. Run `npm install` in the `sorcerer_react` folder

### Start Development Environment

1. Run `python backend/app.py` to start the backend
2. Enter the `sorcerer_react` directory and run `npm start` to start the frontend.

This will expose the frontend on http://localhost:3000/. The development servers will reload upon code changes.
