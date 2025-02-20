import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux'; // Import combineReducers
import { BrowserRouter as Router } from 'react-router-dom';
import HostView from '../../views/components/Hosts/HostView';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme();

// Create a rootReducer that includes the necessary reducers
const rootReducer = combineReducers({
  // Include the necessary reducers here, for example:
  siteRegistry: (state = { sites: [] }, action) => state
  // Add other reducers as needed
});

const store = createStore(rootReducer); // Use the rootReducer

// Mock localStorage
Storage.prototype.getItem = jest.fn(() => JSON.stringify({ net_name: 'test' }));

describe('HostView', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <HostView />
          </Router>
        </ThemeProvider>
      </Provider>
    );
  });
});
