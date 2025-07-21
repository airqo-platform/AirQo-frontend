/* eslint-env cypress */
import React from 'react';
import { mount } from '@cypress/react';
import { Provider } from 'react-redux';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import createStore from '@/lib/store';

describe('GlobalTopbar Component', () => {
  it('should render the GlobalTopbar component', () => {
    const store = createStore();
    mount(
      <Provider store={store}>
        <GlobalTopbar />
      </Provider>,
    );
    cy.get('[data-cy=topbar]').should('be.visible');
  });

  it('should show the dropdown menu when the user clicks on the profile icon', () => {
    const store = createStore();
    mount(
      <Provider store={store}>
        <GlobalTopbar />
      </Provider>,
    );
    cy.get('[data-cy=profile-btn]').click();
    cy.get('[data-cy=topbar-dropdown-menu]').should('be.visible');
  });
});
