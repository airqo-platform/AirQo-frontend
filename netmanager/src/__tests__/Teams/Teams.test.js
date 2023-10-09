import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import Teams from '../../views/pages/Teams/Teams';

const theme = createMuiTheme();

describe('Teams Component', () => {
  it('renders without errors', () => {
    const { getByText } = render(
      <Router>
        <Provider>
          <ThemeProvider theme={theme}>
            <Teams />
          </ThemeProvider>
        </Provider>
      </Router>
    );
    expect(getByText('Create a Team')).toBeInTheDocument();
  });
});
