import './index.css';
import './App.scss';

import * as serviceWorker from './serviceWorker';
import * as api from "./apiConnector"

import {$,jQuery} from 'jquery';
// export for others scripts to use
window.$ = $;
window.jQuery = jQuery;


const name = prompt("Enter your name (or empty for random name)")

api.init(name)


/*
ReactDOM.render(
  <React.StrictMode>
    <NameModal modalHandler={onNameSelect} />
  </React.StrictMode>,
  document.getElementById('root')
);
*/

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
