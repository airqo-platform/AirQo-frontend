import React from 'react';
import ReactDOM from 'react-dom';
//import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store';
import * as serviceWorker from './serviceWorker';
import App from './App';


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
