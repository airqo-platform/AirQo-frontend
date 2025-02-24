import React from 'react';
import { getByTestId, render, screen } from '@testing-library/react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom';
import RootReducer from '../../redux/SiteRegistry/reducers';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import GridsRegistry from '../../views/pages/GridsRegistry';
import AddGridToolbar from '../../views/pages/GridsRegistry/AddGridForm';

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

describe('GridsRegistry', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <GridsRegistry />
          </Router>
        </ThemeProvider>
      </Provider>
    );
  });

  it('opens the add grid dialog on click', () => {
    const dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({
      polygonShape: {
        type: 'Polygon',
        coordinates: [
          [
            [32.56897, 0.444942],
            [32.470093, 0.282897],
            [32.56485, 0.181274],
            [32.56897, 0.444942]
          ]
        ]
      }
    });

    const { queryByTestId } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <AddGridToolbar open={true} />
        </ThemeProvider>
      </Provider>
    );

    expect(queryByTestId('add-grid-form-title')).toBeDefined();
  });
});
