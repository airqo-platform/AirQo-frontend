import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit'; // Updated import
import { BrowserRouter as Router } from 'react-router-dom';
import HostView from '../../views/components/Hosts/HostView';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme();

const rootReducer = combineReducers({
  siteRegistry: (state = { sites: [] }, action) => state
  // Include other reducers as needed
});

const store = configureStore(rootReducer);

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
    // Add assertions here to verify the component's behavior
  });
});
