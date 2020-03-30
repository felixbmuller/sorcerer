import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import $ from 'jquery';

var REQUEST_BASE = "/rest/"

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // dev mode
    REQUEST_BASE = "http://127.0.0.1:5000/"
}


const REFRESH_INTERVAL = 500

let thisPlayer = null
let stopRefresh = false

let previousJson = ""

function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}

function refreshPage(repeat = true) {

    if(stopRefresh) {
        ReactDOM.render(
            <React.StrictMode>
              <p>You can now close this page.</p>
            </React.StrictMode>,
            document.getElementById('root')
          );
        return
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status != 200 || this.responseText.startsWith("Error:")) {
                alert(this.responseText)
            } else {
                if (this.responseText != previousJson) {
                ReactDOM.render(
                    <React.StrictMode>
                      <App state={JSON.parse(this.responseText)}/>
                    </React.StrictMode>,
                    document.getElementById('root')
                  );
                }
                previousJson = this.responseText
            }

            if (repeat) {
                setTimeout(refreshPage, REFRESH_INTERVAL)
            }
        }
    };
    xhttp.open("GET", REQUEST_BASE + "getjson" + formatParams({player: thisPlayer}), true);
    xhttp.send();

}

function backend_call(action, params) {
    /**
     * silent is set to True to surpress error messages, e.g. when closing the window
     */
    if (thisPlayer == null) {
        alert("Tried to send a request before the player was added to the server!")
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status != 200 || this.responseText.startsWith("Error:")) {
                alert(this.responseText)
            } else {
                refreshPage(false)
            }
        }
    };
    xhttp.open("GET", REQUEST_BASE + action + formatParams(params), true);
    xhttp.send();
}

export function resetServer() {
    const ok = window.confirm(
            "You are about to reset the game server.\n\nThis will kick everybody " +
            "out of the lobby. You should only do this if there is a " +
            "non-responding player (e.g. because somebody closed this page " +
            "without clicking 'Leave lobby' beforehand). Everybody currently in " +
            "the lobby will see a weird error message and needs to reload the page.\n\n" +
            "Do you really want to continue?")
    if (ok) {
        backend_call("resetserver", {})
    }
}

export function playCard(card) {
    backend_call("playcard", {player: thisPlayer, card: card})
}

export function abortGame() {
    backend_call("stopgame", {})
}

export function announceTricks() {
    const n = $("#tricksInput").val()
    backend_call("announcetricks", {player: thisPlayer, n: n})
}


export function startGame() {
    backend_call("startgame", {})
}

export function removePlayer() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status != 200 || this.responseText.startsWith("Error:")) {
                alert(this.responseText)
            } else {
                stopRefresh = true
            }
        }
    };
    xhttp.open("GET", REQUEST_BASE + "removeplayer" + formatParams({ 'player': thisPlayer }), true);
    xhttp.send();
}


export function init(name) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status != 200 || this.responseText.startsWith("Error:")) {
                alert(this.responseText + " Reload page.")
            } else {
                thisPlayer = this.responseText
                refreshPage()
            }
        }
    };
    xhttp.open("GET", REQUEST_BASE + "addplayer" + formatParams({ 'player': name }), true);
    xhttp.send();
}


export function init_2(name) {
    $.ajax({
        url: REQUEST_BASE + "addplayer",
        data: {player: name},
        error: (obj, str) => alert("Error during init: " + str + JSON.stringify(obj)),
        success: (data) => {
            if (data.startsWith("Error:")) {
                // TODO use nicer boostrap alert here
                alert(data + ". Reload the window to retry.")
            } else {
                thisPlayer = data
                refreshPage()
            }
        }
    })
}

