describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit('/settings'); // Assuming '/settings' is the correct route for the Settings component
  });

  it('should render the Layout component', () => {
    cy.get('body').should('contain', 'Settings');
    cy.get('[data-testid="layout"]').should('exist');
  });

  it('should render the Tabs component', () => {
    cy.get('[data-testid="tabs"]').should('exist');
    cy.get('[data-testid="tab"]').should('have.length', 1);
  });

  it('should render the Tab content', () => {
    cy.get('[data-testid="tab"]').first().click();
    cy.get('[data-testid="tab-content"]').should('contain', 'One');
  });

  it('should render the Alert tab in Password component', () => {
    cy.get('[data-testid="save-button"]').first().click();
    cy.get('[data-testid="alert-box"]').should('contain', 'One');
  });
});
