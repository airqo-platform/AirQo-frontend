import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import SiteToolbar from '../../views/components/Sites/SiteToolbar';
import RootReducer from '../../redux/SiteRegistry/reducers';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme(); // creates default theme
const store = createStore(RootReducer); // creates store with root reducer

// Mock localStorage
Storage.prototype.getItem = jest.fn(() => JSON.stringify({ net_name: 'test' }));

describe('SiteToolbar', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SiteToolbar />
        </ThemeProvider>
      </Provider>
    );
  });

  it('opens the form dialog on click', () => {
    const { getAllByText } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SiteToolbar />
        </ThemeProvider>
      </Provider>
    );

    const addButton = getAllByText(/Add Site/i)[0];
    fireEvent.click(addButton);

    const formDialog = getAllByText(/Add Site/i)[1];
    expect(formDialog).toBeTruthy();
  });
});
