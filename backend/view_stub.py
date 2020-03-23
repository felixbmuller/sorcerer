
import datetime

def get_data(player: str):
    view_stub = {
        "players": ["Felix", "AL", "Cat"],
        "scoreboard_table": list(enumerate([
            [20, 0, -10, 0, 20, 0],
            [50, 1, 10, 0, 10, 1],
            ["", 2, "", 1, "", 0],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
        ], start=1)),
        "this_player": player,
        "hasTrumpCard": False,
        "trump": {"suit": "Y", "rank": "Z"},
        "currentRound": 3,
        "currentPhase": "Play",
        "playerState": "tricks",
        "illegal_tricks": 0,
        "activePlayer": "Fox",
        "table_players": ["Cat", "Dog"],
        "table_cards": [
            {"suit": "R", "rank": "13"},
            {"suit": "Y", "rank": "N"},
        ],
        "hand_cards": [
            {"suit": "B", "rank": "13"},
            {"suit": "G", "rank": "Z"},
        ],
        "last_refresh": str(datetime.datetime.now().time()),
    }
    return view_stub