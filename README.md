# sorcerer

## Deployment

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
   you can copy the version in `deployment/` to `/etc/. This enables autostart for flask.
7. To stop the servers, run `killall flask` and `sudo service nginx stop`

**Note:** This is quite hacky because I need to use the flask development server instead
of gunicorn (thats an open issue).

Please have a look at `deploy.sh` if it is suitable for your system before you run it. It is
very simple.
