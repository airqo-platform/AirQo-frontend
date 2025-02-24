import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createStore } from 'redux';
import RootReducer from '../../redux';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Register from '../../views/pages/SignUp/Register';

const theme = createMuiTheme();
const store = createStore(RootReducer);

// Mock auth context
const mockAuthContext = {
  auth: {
    isAuthenticated: false,
    register: jest.fn()
  },
  errors: {},
  user: {},
  loading: false,
  register: jest.fn()
};

jest.mock('../../redux/AccessControl/reducers', () => ({
  useAuthContext: () => mockAuthContext
}));

describe('RegisterView', () => {
  it('renders the RegisterView page', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <Register />
          </Router>
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByText(/AirQo Access Request/i)).toBeInTheDocument();
  });

  it('displays error messages for required fields when submitting without filling them', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <Register />
          </Router>
        </ThemeProvider>
      </Provider>
    );

    const requestAccessButton = screen.getByText(/REQUEST ACCESS/i);
    fireEvent.click(requestAccessButton);

    const firstNameError = screen.getByText(/First name is required/i);
    const lastNameError = screen.getByText(/Last name is required/i);

    expect(firstNameError).toBeInTheDocument();
    expect(lastNameError).toBeInTheDocument();
  });
});
