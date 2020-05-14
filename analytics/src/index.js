import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";

import { createStore, combineReducers } from 'redux';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { reducer as formReducer } from 'redux-form';
import App from './App';

//ReactDOM.render(<App />, document.getElementById('root'));

const rootReducer = combineReducers({
    form: formReducer,
  });

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );

serviceWorker.unregister();
