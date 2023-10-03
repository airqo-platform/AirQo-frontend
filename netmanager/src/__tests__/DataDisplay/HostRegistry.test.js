import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom';
import HostView from '../../views/components/Hosts/HostView';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme();
const store = createStore(() => ({}));

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
