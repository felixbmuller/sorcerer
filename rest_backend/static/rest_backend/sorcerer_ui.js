


function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}

function backend_call(action, params, silent = false) {
    /**
     * silent is set to True to surpress error messages, e.g. when closing the window
     */
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (!silent && this.readyState == 4 
            && (this.status != 200 || this.responseText.startsWith("Error:"))) {
            alert(this.responseText)
        }
    };
    xhttp.open("GET", "/rest/" + action + "/" + formatParams(params), true);
    xhttp.send();
}

function on_startup() {

    var name = prompt("Please enter your name")

    if (name == null) {
        name = ""
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status != 200 || this.responseText.startsWith("Error:")) {
                alert(this.responseText + " Reload page.")
            } else {
                this_player = this.responseText
                refresh_page()
            }
        }
    };
    xhttp.open("GET", "/rest/addplayer/" + formatParams({ 'player': name }), true);
    xhttp.send();
}

REFRESH_INTERVAL = 500

function refresh_page() {

    if (stop_reloading) {
        document.body.innerHTML = "You can now close this page."
        return
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status != 200 || this.responseText.startsWith("Error:")) {
                alert(this.responseText)
            } else {
                // Keep what the user entered in the trick enter dialog
                var inputField = document.getElementById('count')
                var savedValue = null
                if (inputField != null) {
                    savedValue = inputField.value
                }
                document.body.innerHTML = this.responseText
                if (savedValue != null && document.getElementById('count') != null) {
                    document.getElementById('count').value = savedValue
                }
            }

            setTimeout(refresh_page, REFRESH_INTERVAL)
        }
    };
    xhttp.open("GET", "/rest/getview/" + formatParams({ 'player': this_player }), true);
    xhttp.send();
}


function on_shutdown() {

    stop_reloading =true
    backend_call('removeplayer', { 'player': this_player })
}

stop_reloading = false
this_player = null
