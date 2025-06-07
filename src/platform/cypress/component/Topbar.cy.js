import React from 'react';
import { mount } from '@cypress/react';
import { Provider } from 'react-redux';
import PageTopBar from '@/components/PageTopBar';
import createStore from '@/lib/store';

describe('PageTopBar Component', () => {
  it('should render the PageTopBar component', () => {
    const store = createStore();
    mount(
      <Provider store={store}>
        <PageTopBar />
      </Provider>,
    );
    cy.get('[data-cy=topbar]').should('be.visible');
  });

  it('should show the dropdown menu when the user clicks on the profile icon', () => {
    const store = createStore();
    mount(
      <Provider store={store}>
        <PageTopBar />
      </Provider>,
    );
    cy.get('[data-cy=profile-btn]').click();
    cy.get('[data-cy=topbar-dropdown-menu]').should('be.visible');
  });
});
