from typing import List, Dict, Tuple, Optional
from collections import namedtuple, OrderedDict
import random
import secrets
import operator
from enum import Enum
import logging
import time
import functools

#animal_names = [
#    "Wunderpus photogenicus",
#    "Spiny lumpsucker",
#    "Pleasing fungus beetle",
#    "Pink fairy armadillo",
#    "Raspberry crazy ant",
#    "Satanic leaf-tailed gecko",
#]

animal_names = [
    "Cat",
    "Dog",
    "Fox",
    "Salmon",
    "Gecko",
    "Ant",
]

class GameError(Exception):
    """ An error that can happen if a player tries something illegal"""
    pass


class StateError(Exception):
    """ This means that the game is in an illegal state, this should not happen """
    pass


Player = str


class PadOfTruth:
    players: List[Player]
    round: int
    announcedTricks: List[Dict[Player, int]]
    actualTricks: List[Dict[Player, int]]
    cumulativeCount: List[Dict[Player, int]]

    def __init__(self, players: List[Player]):
        self.players = players
        self.round = -1 # not started
        self.announcedTricks = []
        self.actualTricks = []
        self.cumulativeCount = []

    def totalRounds(self) -> int:
        """return the number of total rounds (depending on the number of players)"""
        return 60 // len(self.players)
        #return 3

    def lastRound(self) -> bool:
        return self.round + 1 == self.totalRounds()

    def newRound(self):
        if self.lastRound():
            raise StateError("The game is over, cannot start a new round!")
        self.round += 1
        self.announcedTricks.append({})
        self.actualTricks.append({p: 0 for p in self.players})
        return round

    def announceTricks(self, player: Player, n: int):
        """ `player` announces that he will take `n` tricks in this round. """
        if player in self.announcedTricks[self.round]:
            raise StateError(
                "A player cannot announce tricks twice for one round.")
        if n < 0:
            raise GameError(
                "The number of announced tricks must be non-negative.")
        self.announcedTricks[self.round][player] = n

    def addTrick(self, player: Player):
        """ `player` took a trick """
        self.actualTricks[self.round][player] += 1

    def remainingTricks(self):
        """ returns <actual tricks> - <already announced tricks> for this round"""
        return self.round + 1 - sum(self.announcedTricks[self.round].values())

    def finishRound(self):
        """ Update the cumulative point count with the results of this round. """
        if not (len(self.announcedTricks[self.round]) == len(self.players)
                and sum(self.actualTricks[self.round].values()) == self.round + 1):
            raise StateError(
                "Can only wrap up a round if every player announced tricks and all tricks were played")
        new_points = {}
        for p in self.players:
            diff = abs(self.announcedTricks[self.round]
                       [p] - self.actualTricks[self.round][p])
            if diff == 0:
                points = 20 + 10 * self.actualTricks[self.round][p]
            else:
                points = -10 * diff

            if self.round == 0:
                new_points[p] = points
            else:
                new_points[p] = self.cumulativeCount[self.round-1][p] + points
        self.cumulativeCount.append(new_points)

    def getRanking(self) -> List[Tuple[Player, int]]:
        """ Returns a list of tuples (player, points) sorted descending by the points, i.e. a ranking
        of the players. This used the points from the last finished round """
        return sorted(self.cumulativeCount[-1].items(), key=operator.itemgetter(1), reverse=True)

def cardSortKey(card: str, trump: str):
    """ create a reasonable order for hand cards """
    if "N" in card:
        return 0
    if "Z" in card:
        return 1000
    rank = int(card[1:])
    if trump in card:
        return 900 + rank
    # get a consistent order of colors, the concrete order does not really matter
    color2value = {
        "R": 200,
        "G": 300,
        "B": 400,
        "Y": 500
    }
    return color2value[card[0]] + rank

class CardManager:
    """ This class handles everything related to cards, i.e. draw and discard pile, hand cards, 
        playing cards...

        Cards are represented as strings, containing a color code (RGBY) and a number/letter 
        (1-3, N, Z). E.g. 'R7', 'YZ', ... narr and zauberer get a color even though it does not matter"""

    # TODO separate trick and round

    drawPile: List[str]
    # no discard pile, the draw pile is regenerated each round
    handCards: Dict[Player, List[str]]
    roundCards: OrderedDict  # player -> card played by him
    players: List[Player]

    roundStarted: bool
    trumpCard: str  # top card used to determine trump or empty if
    # no cards left
    trumpColor: str  # trump color or empty if no color (i.e. narr, zauberer)

    def __init__(self, players: List[Player]):
        self.players = players
        self.roundStarted = False

    def startRound(self, noOfCards: int):
        """ deal cards and start round """
        if self.roundStarted:
            raise StateError(
                "Can only start a round if it is not already started!")
        self._createDrawPile()
        self.roundCards = OrderedDict()
        self.handCards = {}
        for p in self.players:
            self.handCards[p] = [self.drawPile.pop() for _ in range(noOfCards)]
        # select trump
        if not self.drawPile:  # no cards left
            self.trumpColor = "-"
            self.trumpCard = ""
        else:
            self.trumpCard = self.drawPile.pop()
            if "N" in self.trumpCard or "Z" in self.trumpCard:
                # no trump if narr/zauberer
                self.trumpColor = "-"
            else:
                self.trumpColor = self.trumpCard[0]

        for p in self.players:
            self.handCards[p].sort(key=functools.partial(cardSortKey, trump=self.trumpColor))

    def roundFinished(self) -> bool:
        return not any(hc for hc in self.handCards.values())

    def finishRound(self):
        if not self.roundFinished():
            # not all cards played
            raise StateError(
                "Cannot finish round if not all cards were played")
        self.roundStarted = False

    def playCard(self, player: Player, card: str):
        if card not in self.handCards[player]:
            raise GameError(
                f"Player {player} tried to play {card} even though it is not in his hand!")
        self._checkPlayable(player, card)
        self.handCards[player].remove(card)
        self.roundCards[player] = card

    def _checkPlayable(self, player: Player, card: str):
        """ check if `card` can be played in the current situation. Raises a GameError if not. """
        if not self.roundCards: # no card played yet
            return
        if "N" in card or "Z" in card:
            return  # always possible to play that
        if "Z" in next(iter(self.roundCards.values())):  # first card wizard
            return  # every card allowed
        if all("N" in c for c in self.roundCards.values()):  # only jesters
            return  # every card allowed
        relevantColor = next(
            c[0] for c in self.roundCards.values() if "Z" not in c and "N" not in c)
        if relevantColor in card:
            return  # right color
        if any(relevantColor in c for c in self.handCards[player] if "N" not in c and "Z" not in c):
            raise GameError("You must play a card of the led suit!")

    def finishTrick(self) -> Player:
        """ wraps up the round and decides who won the trick.
        Note: There is no start trick """
        if len(self.roundCards) != len(self.players):
            raise StateError(
                "Tried to finish a trick before every player played a card")
        trickTaker = self._determineTrickTaker()
        self.roundCards = OrderedDict()
        return trickTaker

    def _determineTrickTaker(self) -> Player:
        """ determine who took the trick """
        if all("N" in c for c in self.roundCards.values()):
            # only jester cards
            return next(iter(self.roundCards.keys()))
        if any("Z" in c for c in self.roundCards.values()):  # a wizard was played
            return next(p for p, c in self.roundCards.items() if "Z" in c)

        if any(self.trumpColor in c for c in self.roundCards.values() if "N" not in c):
            relevantColor = self.trumpColor # TODO fixme
        else:
            relevantColor = next(
                c[0] for c in self.roundCards.values() if "N" not in c)

        trickTaker, _ = max(((p, c) for p, c in self.roundCards.items() if relevantColor in c and "N" not in c),
                            key=lambda x: int(x[1][1:]))
        return trickTaker

    def _createDrawPile(self):
        self.drawPile = []
        for c in ["R", "G", "B", "Y"]:
            for n in list(range(1, 14)) + ["N", "Z"]:
                self.drawPile.append(f"{c}{n}")
        random.shuffle(self.drawPile)


class GameState(Enum):
    ANNOUNCE = 1
    PLAY = 2
    PAUSE = 3
    FINISHED = 4
    ABORTED = 5


class Game:
    players: List[Player]
    padOfTruth: PadOfTruth
    cardManager: CardManager

    gameState: GameState  # False = playing cards
    startPlayerIdx: int
    currentPlayerIdx: int
    ranking: List[Tuple[Player, int]]

    def __init__(self, players: List[Player]):
        self.players = list(players)
        self.padOfTruth = PadOfTruth(self.players)
        self.cardManager = CardManager(self.players)

        self.padOfTruth.newRound()
        self.cardManager.startRound(self.padOfTruth.round+1) #deal cards etc
        self.gameState = GameState.ANNOUNCE
        self.roundStartPlayerIdx = 0  # player starting the round, ie clockwise
        # player starting the trick, i.e. who won last trick or roundStartPlayerIdx
        self.trickStartPlayerIdx = 0
        self.currentPlayerIdx = 0

    def getIllegalTricks(self, player: Player) -> int:
        if self.players[self.currentPlayerIdx] != player:
            logging.warn("Requested getIllegalTricks() for player who is not active!")
            return -1

        if self.currentPlayerIdx == (self.roundStartPlayerIdx - 1) % len(self.players):
            # has limitation
            remaining = self.padOfTruth.remainingTricks()
            if remaining >= 0:
                return remaining
            else:
                return -1
        else:
            return -1

    def announceTricks(self, player: Player, n: int):
        if self.gameState != GameState.ANNOUNCE:
            raise GameError(
                "Cannot announce tricks if not in announcement phase")
        if not self._player2index(player) == self.currentPlayerIdx:
            raise GameError("Cannot announce tricks if it is not your turn")

        if (self.currentPlayerIdx == (self.roundStartPlayerIdx - 1) % len(self.players)
                and n == self.padOfTruth.remainingTricks()):
            raise GameError(
                "The number of announced tricks must not equal the number of actual tricks!")

        self.padOfTruth.announceTricks(player, n)

        self.currentPlayerIdx = (self.currentPlayerIdx + 1) % len(self.players)

        if self.currentPlayerIdx == self.roundStartPlayerIdx:
            self.gameState = GameState.PLAY
            # finished announcing
            self.trickStartPlayerIdx = self.roundStartPlayerIdx

    def playCard(self, player: Player, card: str):
        if self.gameState != GameState.PLAY:
            raise GameError("Cannot play cards if not in card playing phase")
        if not self._player2index(player) == self.currentPlayerIdx:
            raise GameError("Cannot play cards if it is not your turn")

        self.cardManager.playCard(player, card)

        self.currentPlayerIdx = (self.currentPlayerIdx + 1) % len(self.players)

        if self.currentPlayerIdx == self.trickStartPlayerIdx:
            self.gameState = GameState.PAUSE
            time.sleep(5.0) # wait for all players to see the card
            self.gameState = GameState.PLAY

            trickTaker = self.cardManager.finishTrick()
            self.padOfTruth.addTrick(trickTaker)
            # init for next trick
            self.trickStartPlayerIdx = self._player2index(trickTaker)
            self.currentPlayerIdx = self._player2index(trickTaker)

            if self.cardManager.roundFinished():
                self.cardManager.finishRound()
                self.padOfTruth.finishRound()

                if self.padOfTruth.lastRound():
                    self.gameState = GameState.FINISHED
                    self.ranking = self.padOfTruth.getRanking()

                else:
                    self.padOfTruth.newRound()
                    self.cardManager.startRound(self.padOfTruth.round+1) #deal cards etc
                    self.gameState = GameState.ANNOUNCE
                    self.roundStartPlayerIdx = (
                        self.roundStartPlayerIdx + 1) % len(self.players)
                    self.trickStartPlayerIdx = self.roundStartPlayerIdx
                    self.currentPlayerIdx = self.roundStartPlayerIdx

    def _player2index(self, player: Player):
        return next(i for i, p in enumerate(self.players) if p == player)


class Lobby:
    players: List[Player]

    game: Optional[Game]  # current or last game

    def __init__(self):
        self.players = []
        self.game = None

    def _validatePlayer(self, player: Player):
        if player not in self.players:
            raise GameError(f"Player {player} not recognized.")

    def hasActiveGame(self) -> bool:
        return (self.game is not None 
                and self.game.gameState not in [GameState.ABORTED, GameState.FINISHED])

    def addPlayer(self, name: str) -> Player:
        if len(self.players) >= 6:
            raise GameError(
                "Cannot add another player, the maximum allowed number is 6")
        if name in self.players:
            raise GameError(f"There is already a player with name {name}")
        if self.hasActiveGame():
            raise GameError("Cannot join lobby as there is currently an active game.")
        if not name:
            name = self._getFreeName()
        self.players.append(name)
        return name

    def removePlayer(self, player):
        self._validatePlayer(player)
        if self.hasActiveGame():
            self.stopGame()
        self.players.remove(player)

    def startGame(self):
        if len(self.players) < 3:
            raise GameError("Cannot play with less than 3 players.")
        if self.hasActiveGame():
            raise GameError("Game already running.")
        self.game = Game(self.players)

    def stopGame(self):
        if not self.hasActiveGame():
            raise GameError("Cannot stop game if it is not running")
        self.game.gameState = GameState.ABORTED

    def playCard(self, player: Player, card: str):
        self._validatePlayer(player)
        if not self.hasActiveGame():
            raise GameError("Cannot play card if game is not running")
        self.game.playCard(player, card)

    def announceTricks(self, player: Player, n: str):
        self._validatePlayer(player)
        if not self.hasActiveGame():
            raise GameError("Cannot announce tricks if game is not running")
        try:
            nint = int(n)
        except ValueError:
            raise GameError("Announced numer must be an integer!")
        self.game.announceTricks(player, nint)

    def _getFreeName(self):
        for n in random.sample(animal_names, len(animal_names)):
            if all(p != n for p in self.players):
                return n
        assert False, "Tried to find a free name even though all were occupied"
