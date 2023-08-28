import React from 'react';
import GenerateToken from '../views/pages/Settings/components/GenerateToken/GenerateToken';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

describe('GenerateToken Component', () => {
  it('opens registration dialog on button click', () => {
    const initialState = {
      auth: {
        user: {
          _id: '123'
        }
      }
    };

    const store = mockStore(initialState);

    const { getByText, queryByText } = render(
      <Provider store={store}>
        <GenerateToken mappedAuth={{ user: { _id: '123' } }} />
      </Provider>
    );

    const registerButton = getByText('Register Client');
    fireEvent.click(registerButton);

    const dialogTitle = queryByText('Register Client');
    expect(dialogTitle).toBeInTheDocument();

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    const closedDialogTitle = queryByText('Register Client');
    expect(closedDialogTitle).toBeNull();
  });
});
