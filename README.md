# sorcerer

## Deployment

1. Install `nginx` according to the instructions for your distribution.
2. Install `python3-dev, python3-pip, python3-venv`
3. Installa recent version of `npm` (problably not in your distros repo, use the website) and make
  sure that the executable is in path
4. Run `bash deploy.sh` in the root directory of this project. 
  This will install dependencies, build the react app and place all files where
  they belong
5. Run `bash run.sh` to start the `gunicorn` and the `nginx` server. This will stop
  both servers if they are already running.
6. If you see the nginx welcome page, there is a default template somewhere in the nginx
  configuration search path that you need to delete. Look into `/etc/nginx/nginx.conf` to see
  what files it includes.
7. To stop the servers, run `killall gunicorn` and `sudo service nginx stop`

Please have a look at `deploy.sh` if it is suitable for your system before you run it. It is
very simple.

## Improvement TODOS

- Better way of showing players the last card instead of long sleep (low prio)
- ~~Handkarten sortieren~~
- ~~Forbid joining lobby if active game~~
- Leichtes grau als Hintergrund
- ~~add "reset server" button~~
- improve error messages
- add favicon -> finish
- add winner ranking
- fixed width for game control and table
- ~~clean setup~~
- ~~add dependency file for python component~~
- make deploy ready
- ~~players replace with tokens~~
- ~~strip whitespace from name~~
- remove npm warnings
- screen freezes for the last player during the 5sec pause (only in production)
- rewrite model to serve requests during the 5sec pause

## Game Logic

1. An user visits the landing page
  - He is automatically registered for the game and gets a random animal name
  - He is informed about his own name and the names of other people in the lobby
2. Any player clicks on "Start game"
3. Every player gets one card and is prompted for the number of tricks he takes (one after the other)
  - The website frequently updates to show the number of tricks other people claimed
  - The input is sanitized to make sure every player claims a legal amount of tricks
  - There is a marker for who the card dealer is
4. For each trick:
  1. The player who starts that trick is prompted to play a card
  2. The other players are prompted to play cards clockwise
  3. The trick-taker is determined and the player for the next round is determined
5. Every player gets points according to the number of tricks we claimed and took
6. Continue with 3.
7. If the maximum number of games is reached, choose a winner
8. Go back to lobby mode (same happens if anybody clicks on abort game)
9. Show results of the last game until a new game is started

## Rest API Description

All data exchange is performed using JSON.

### `rest/register`

**Parameters**: None

**Return**: `{"status": "ok", "name": <random animal name>, "id": <random identification token>}`

**Errors**: If a game is currently running, this returns `{"status": "error", "error": "Cannot join running game"}` (or similar)

**Feature**: Safe the token as cookie?

### `rest/startgame`

**Parameters**: None

**Return**: `{"status": "ok"}`

**Errors**: If a game is currently running, this returns `{"status": "error", "error": "Game already started"}` (or similar)

### `rest/stopgame`

**Parameters**: None

**Return**: `{"status": "ok"}`

**Errors**: If no game is currently running, this returns `{"status": "error", "error": "No active game"}` (or similar)

### `rest/getstatus`

**Parameters:** `{"id": <identification token>}`

**Returns:**

```python
{
  "round": 0 # game round, 0 means lobby
  "player": ["Fox", "Dog"] # player names in the order they appear in the table and in the order they take their turns
  "active_player": 0 # indes of the player who needs to take some action (claiming tricks/playing cards)
  "this_player": 0 # index of the current player
  "round_part": "tricks"|"cards" # current part of the round
  "table": [] # table containing all claimed and actual tricks of all rounds (see below for details)
  "must_not_say_tricks": 1 # number of tricks a player may not claim (or -1 if no limit/not applicable)
}
```
