import React from 'react';
import { render } from '@testing-library/react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom';
import RootReducer from '../../redux/SiteRegistry/reducers';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CohortsRegistry from '../../views/pages/CohortsRegistry';

const theme = createMuiTheme();
const store = createStore(RootReducer);

Storage.prototype.getItem = jest.fn(() =>
  JSON.stringify({
    activeNetwork: {
      net_name: 'test',
      _id: '1234'
    }
  })
);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}));

describe('CohortsRegistry', () => {
  it('renders without crashing', () => {
    const dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({ devices: [] });
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <CohortsRegistry />
          </Router>
        </ThemeProvider>
      </Provider>
    );
  });
});
