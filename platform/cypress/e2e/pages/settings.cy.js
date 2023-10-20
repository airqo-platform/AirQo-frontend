describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit('/settings');
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
    cy.get('[data-testid="tab-content"]').should('exist');
  });

  it('should render the Alert tab in Password component', () => {
    cy.get('[data-testid="save-button"]').first().click();
    cy.get('[data-testid="alert-box"]').should('exist');
  });

  it('should render the form', () => {
    cy.get('[data-testid="form-box"]').should('exist');
  });

  // Team Tab tests
  it('should show the Team tab when clicked', () => {
    cy.contains('Team').click();
    cy.get('[data-testid="team-tab"]').should('be.visible');
  });

  it('displays user data when loaded', () => {
    cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
    cy.get('[data-testid="settings-team-table"]').should('not.exist');
    cy.get('.skeleton').should('exist');
    cy.wait('@getUsers');
    cy.get('.skeleton').should('not.exist');
    cy.get('[data-testid="settings-team-table"]').should('exist');

    cy.fixture('users.json').then((users) => {
      users.forEach((user, index) => {
        cy.get(`tr[data-testid="user-row-${index}"]`).should('exist');
        cy.get(`tr[data-testid="user-row-${index}"] td`).eq(0).should('contain', user.firstName);
        cy.get(`tr[data-testid="user-row-${index}"] td`).eq(1).should('contain', user.status);
        cy.get(`tr[data-testid="user-row-${index}"] td`).eq(2).should('contain', user.createdAt);
        cy.get(`tr[data-testid="user-row-${index}"] td`).eq(3).should('contain', user.jobTitle);
        cy.get(`tr[data-testid="user-row-${index}"] td`)
          .eq(4)
          .should('contain', user.role.role_name);
      });
    });
  });
});
