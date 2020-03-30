import sys
import traceback
import logging
import json
import secrets

from flask import Flask, request
from flask_cors import CORS

from model import Lobby, GameError
from view import View

app = Flask(__name__)
CORS(app)

lobby = Lobby()

view = View(lobby)

token2player = {}

def authPlayer(token: str) -> str:
    """ return the player behind the token if valid and raise a GameError if
    not """
    if token in token2player:
        return token2player[token]
    else:
        raise GameError("There is no valid player with your access token. \n"
                        "Problably somebody reset the server and you need to "
                        "reload the page to join again.")

@app.route("/rest/getjson")
def getjson():
    try:
        return view.data(authPlayer(request.args["player"]))
    except GameError as e:
        return _respond_error(e)

@app.route("/rest/resetserver")
def resetserver():
    global lobby
    global view
    global token2player
    lobby = Lobby()
    view = View(lobby)
    token2player = {}
    return "OK"

@app.route("/rest/addplayer")
def addplayer():
    player_name = _perform_request(request, lobby.addPlayer, name=request.args.get("player", ""))
    token = secrets.token_urlsafe()
    token2player[token] = player_name
    return token

@app.route("/rest/removeplayer")
def removeplayer():
    return _perform_request(request, lobby.removePlayer, player=authPlayer(request.args["player"]))

@app.route("/rest/startgame")
def startgame():
    return _perform_request(request, lobby.startGame)

@app.route("/rest/stopgame")
def stopgame():
    authPlayer(request.args["player"])
    return _perform_request(request, lobby.stopGame)

@app.route("/rest/announcetricks")
def announcetricks():
    return _perform_request(request, lobby.announceTricks,
                            player=authPlayer(request.args["player"]),
                            n=request.args["n"])

@app.route("/rest/playcard")
def playcard():
    return _perform_request(request, lobby.playCard,
                            player=authPlayer(request.args["player"]),
                            card=request.args["card"])


def _perform_request(req, func, **params):
    try:
        ret = func(**params)
        if ret is None:
            return "OK"
        else:
            return str(ret)
    except GameError as e:
        return _respond_error(e)


def _respond_error(e):
    logging.info(f"[GameError] {request.method} {request.full_path}: {e}")
    return f"Error: {e}", 400
