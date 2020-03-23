


function formatParams( params ){
    return "?" + Object
          .keys(params)
          .map(function(key){
            return key+"="+encodeURIComponent(params[key])
          })
          .join("&")
  }

function backend_call(action, params, silent=False) {
    /**
     * silent is set to True to surpress error messages, e.g. when closing the window
     */
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (!silent && this.readyState == 4 && this.status == 200) {
            if (this.responseText.startsWith("Error:")) {
                alert(this.responseText)
            }
        }
    };
    xhttp.open("GET", "rest/" + action + "/" + formatParams(params), true);
    xhttp.send();
}

function update_page() {

}

function on_startup() {

    var name = prompt("Please enter your name")

    if (name == null) {
        name = ""
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // TODO catch other error cases as well
            if (this.responseText.startsWith("Error:")) {
                alert(this.responseText + " Reload page.")
            } else {
                this_player = this.responseText
                window.onbeforeunload = on_shutdown
                refresh_page()
            }
        }
    };
    xhttp.open("GET", "rest/addplayer/" + formatParams({'player': name}), true);
    xhttp.send();
}

REFRESH_INTERVAL = 1000

function refresh_page() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // TODO catch other error cases as well
            if (this.responseText.startsWith("Error:")) {
                alert(this.responseText)
            } else {
                document.body.innerHTML = this.responseText
            }

            setTimeout(refresh_page, REFRESH_INTERVAL)
        }
    };
    xhttp.open("GET", "rest/addplayer/" + formatParams({'player': name}), true);
    xhttp.send();
}

function on_shutdown() {
    
    // TODO async false here?
    backend_call('removeplayer', {'player': this_player}, silent=True)
}

this_player = null