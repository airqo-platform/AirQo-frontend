import React from 'react';
import OrgToolbar from '../../views/pages/Organisation/components/toolbar';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import RootReducer from '../../redux/AccessControl/reducers';

const initialState = {
  userPreference: {
    pagination: {
      page: 1,
      limit: 10
    }
  }
};

const store = createStore(RootReducer, initialState);

describe('OrgToolbar', () => {
  it('check if renders well, "Register new organisation" button and opens a modal on click', () => {
    const { getByText } = render(
      <Provider store={store}>
        <OrgToolbar />
      </Provider>
    );

    const button = getByText(/Register new organisation/i);
    expect(button).toBeTruthy();

    fireEvent.click(button);

    const modal = getByText(/Submit/i);
    expect(modal).toBeTruthy();
  });

  it('displays organisation details when fetched successfully', async () => {
    jest.mock('axios', () => {
      return {
        get: () =>
          Promise.resolve({
            data: {
              networks: [
                {
                  _id: 'testNetworkId',
                  net_name: 'testNetworkName',
                  net_email: 'testNetworkEmail@gmail.com',
                  net_phoneNumber: '1234567890',
                  net_website: 'www.testNetworkWebsite.com',
                  net_category: 'testNetworkCategory',
                  net_description: 'testNetworkDescription'
                }
              ]
            }
          })
      };
    });

    localStorage.setItem('currentUser', JSON.stringify({ _id: 'testUserId' }));

    render(
      <Provider store={store}>
        <OrgToolbar />
      </Provider>
    );
  });
});
