import sys
import traceback
import logging
import json

from django.shortcuts import render
from django.http import HttpResponse, HttpRequest

from model import Lobby, GameError
from backend.view import View

lobby = Lobby()

view = View(lobby)

def main(request):
    return render(request, "rest_backend/main.html", {})

def getview(request):
    try:
        params = request.GET
        if view.isLobbyMode():
            return render(request, "rest_backend/lobby.html", view.lobbyData(params["player"]))
        else:
            return render(request, "rest_backend/game.html", view.gameData(params["player"]))
    except GameError as e:
        return _respond_error(e, request)

def getjson(request):
    try:
        return HttpResponse(json.dumps(view.data(request.GET["player"])), content_type="application/json")
    except GameError as e:
        return _respond_error(e, request)

def addplayer(request):
    return _perform_request(request, lobby.addPlayer, name=request.GET.get("player", ""))


def removeplayer(request):
    return _perform_request(request, lobby.removePlayer, player=request.GET["player"])


def startgame(request):
    return _perform_request(request, lobby.startGame)


def stopgame(request):
    return _perform_request(request, lobby.stopGame)


def announcetricks(request):
    return _perform_request(request, lobby.announceTricks,
                            player=request.GET["player"],
                            n=request.GET["n"])


def playcard(request):
    return _perform_request(request, lobby.playCard,
                            player=request.GET["player"],
                            card=request.GET["card"])


def _perform_request(req, func, **params):
    try:
        ret = func(**params)
        if ret is None:
            return HttpResponse("OK")
        else:
            return HttpResponse(str(ret))
    except GameError as e:
        return _respond_error(e, req)


def _respond_error(e, req: HttpRequest):
    logging.info(f"[GameError] {req.method} {req.get_full_path()}: {e}")
    return HttpResponse(f"Error: {e}")
