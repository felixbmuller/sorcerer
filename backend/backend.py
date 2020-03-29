import sys
import traceback
import logging
import json

from flask import Flask, request
from flask_cors import CORS

from model import Lobby, GameError
from view import View

app = Flask(__name__)
CORS(app)

lobby = Lobby()

view = View(lobby)

@app.route("/rest/getjson")
def getjson():
    try:
        return view.data(request.args["player"])
    except GameError as e:
        return _respond_error(e)

@app.route("/rest/addplayer")
def addplayer():
    return _perform_request(request, lobby.addPlayer, name=request.args.get("player", ""))

@app.route("/rest/removeplayer")
def removeplayer():
    return _perform_request(request, lobby.removePlayer, player=request.args["player"])

@app.route("/rest/startgame")
def startgame():
    return _perform_request(request, lobby.startGame)

@app.route("/rest/stopgame")
def stopgame():
    return _perform_request(request, lobby.stopGame)

@app.route("/rest/announcetricks")
def announcetricks():
    return _perform_request(request, lobby.announceTricks,
                            player=request.args["player"],
                            n=request.args["n"])

@app.route("/rest/playcard")
def playcard():
    return _perform_request(request, lobby.playCard,
                            player=request.args["player"],
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
