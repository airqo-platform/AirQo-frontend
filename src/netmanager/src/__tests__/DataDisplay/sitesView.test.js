import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom';
import SiteView from '../../views/components/Sites/SiteView';
import RootReducer from '../../redux/SiteRegistry/reducers';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme();
const store = createStore(RootReducer);

Storage.prototype.getItem = jest.fn(() => JSON.stringify({ net_name: 'test' }));

describe('SiteView', () => {
  it('renders without crashing', () => {
    const currentRole = {
      role_permissions: [{ permission: 'requiredPermission' }]
    };

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Router>
            <SiteView currentRole={currentRole} />
          </Router>
        </ThemeProvider>
      </Provider>
    );
  });
});
