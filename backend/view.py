import datetime

from backend.model import Lobby, PadOfTruth, CardManager, GameState, Player, GameError

class View():

    lobby: Lobby

    def __init__(self, lobby: Lobby):
        self.lobby = lobby

    def isLobbyMode(self) -> bool:
        return not self.lobby.hasActiveGame()

    def lobbyData(self, player: Player):
        if player not in self.lobby.players:
            raise GameError("Requesting view for not-existing player")

        hasLastGame = self.lobby.game is not None

        if hasLastGame:
            scoreboardPlayers = self.lobby.game.players
            scoreboardTable = self._genScoreboard()
        else:
            scoreboardTable = None
            scoreboardPlayers = None

        hasLastWinners = hasLastGame and self.lobby.game.gameState == GameState.FINISHED
        if hasLastWinners:
            ranking = self.lobby.game.ranking
        else:
            ranking = None

        data = {
            "scoreboardPlayers": scoreboardPlayers,
            "scoreboardTable": scoreboardTable,
            "hasLastGame": hasLastGame,
            "thisPlayer": player,
            "lobbyPlayers": self.lobby.players,
            "hasLastWinners": hasLastWinners,
            "ranking": ranking,
            "lastRefresh": str(datetime.datetime.now().time()),
        }
        return data

    def gameData(self, player: Player):
        assert self.lobby.hasActiveGame()

        if player not in self.lobby.players:
            raise GameError("Requesting view for not-existing player")

        pad = self.lobby.game.padOfTruth
        players = self.lobby.game.players
        cards = self.lobby.game.cardManager
        game = self.lobby.game

        scoreboard_table = self._genScoreboard()

        # Play for PLAY and PAUSE
        phase = "Announce" if game.gameState == GameState.ANNOUNCE else "Play"

        if game.gameState == GameState.PAUSE:
            player_state = "pause"
        elif players[game.currentPlayerIdx] == player:
            # active
            if game.gameState == GameState.PLAY:
                player_state = "play"
            else:
                player_state = "tricks"
        else:
            player_state = "waiting"
            

        illegal_tricks = -1 # no limitation
        if player_state == "tricks":
            illegal_tricks = game.getIllegalTricks(player)

        actualTricks = []
        if pad.actualTricks:
            for p in players:
                actualTricks.append(pad.actualTricks[-1].get(p, 0))

        data = {
            "scoreboardPlayers": players,
            "scoreboardTable": scoreboard_table,
            "thisPlayer": player,
            "hasTrumpCard": cards.trumpColor != "-",
            "trump": self._convertCard(cards.trumpCard),
            "currentRound": pad.round + 1,
            "currentPhase": phase,
            "playerState": player_state,
            "illegalTricks": illegal_tricks,
            "activePlayer": players[game.currentPlayerIdx],
            "tablePlayers": cards.roundCards.keys(),
            "tableCards": [self._convertCard(c) for c in cards.roundCards.values()],
            "handCards": [self._convertCard(c) for c in cards.handCards[player]],
            "lastRefresh": str(datetime.datetime.now().time()),
            "actualTricks": actualTricks,
        }
        return data

    def _genScoreboard(self):
        """ render table html ready """
        pad = self.lobby.game.padOfTruth

        scoreboard_table = []
        for i in range(pad.totalRounds()):
            row = []
            for p in pad.players:
                if i < len(pad.cumulativeCount) and p in pad.cumulativeCount[i]:
                    row.append(pad.cumulativeCount[i][p])
                else:
                    row.append("")

                if i < len(pad.announcedTricks) and p in pad.announcedTricks[i]:
                    row.append(pad.announcedTricks[i][p])
                else:
                    row.append("")

            scoreboard_table.append(row)
        return list(enumerate(scoreboard_table, start=1))

    def _convertCard(self, card: str):
        if card == "":
            return {"full": card, "suit": "B", "rank": "-"}
        return {"full": card, "suit": card[0], "rank": card[1:]}