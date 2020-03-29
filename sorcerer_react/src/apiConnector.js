import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


const REQUEST_BASE = "http://localhost:8000/rest/"
const REFRESH_INTERVAL = 500

let thisPlayer = null
let stopRefresh = false

function backend_call(action, params) {
    /**
     * silent is set to True to surpress error messages, e.g. when closing the window
     */
    if (thisPlayer == null) {
        alert("Tried to send a request before the player was added to the server!")
    }
    $.ajax({
        url: REQUEST_BASE + action,
        data: params,
        error: (obj, str) => alert("Error: " + str),
        success: (data) => {
            if (data.startsWith("Error:")) {
                // TODO use nicer boostrap alert here
                alert(data)
            } else {
                refreshPage(false)
            }
        }
    })
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
    $.ajax({
        url: REQUEST_BASE + "removeplayer",
        data: {player: thisPlayer},
        error: (obj, str) => alert("Error: " + str),
        success: (data) => {
            if (data.startsWith("Error:")) {
                // TODO use nicer boostrap alert here
                alert(data)
            } else {
                stopRefresh = true
            }
            refreshPage(false)
        }
    })
}

export function init(name) {
    $.ajax({
        url: REQUEST_BASE + "addplayer",
        data: {player: name},
        error: (obj, str) => alert("Error: " + str),
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

function refreshPage(repeat = true) {

    if(stopRefresh) {
        ReactDOM.render(
            <React.StrictMode>
              <p>You can now close this page.</p>
            </React.StrictMode>,
            document.getElementById('root')
          );
    }

    $.ajax({
        url: REQUEST_BASE + "getjson",
        data: {player: thisPlayer},
        error: (obj, str) => alert("Error: " + str),
        success: (data) => {
            if (data.startsWith("Error:")) {
                // TODO use nicer boostrap alert here
                alert(data)
            } else {
                // TODO only re-render if changed?
                // TODO unpack json
                ReactDOM.render(
                    <React.StrictMode>
                      <App state={data}/>
                    </React.StrictMode>,
                    document.getElementById('root')
                  );
            }

            if (repeat) {
                setTimeout(refresh_page, REFRESH_INTERVAL)
            }
        }
    })

}
