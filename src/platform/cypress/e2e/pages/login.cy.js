describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/account/login'); // Assuming '/login' is the correct route for the Login component
  });

  it('should render the form', () => {
    cy.get('[data-testid="login-form"]').should('exist');
  });

  it('should fill in the form', () => {
    cy.get('[data-testid="username"]').type('username');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="login-btn"]').first().click();
  });

  it('should render the alert', () => {
    cy.get('[data-testid="alert-box"]').should('exist');
  });
});
