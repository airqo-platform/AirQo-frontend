describe('DataTable', () => {
  beforeEach(() => {
    cy.visit('/collocation/collocate');
  });

  it('displays the table headers', () => {
    cy.get('thead').should('contain', 'Monitor name');
    cy.get('thead').should('contain', 'Batch name');
    cy.get('thead').should('contain', 'Date added');
    cy.get('thead').should('contain', 'Added by');
    cy.get('thead').should('contain', 'Start date');
    cy.get('thead').should('contain', 'End date');
    cy.get('thead').should('contain', 'Status');
  });

  it('displays the table rows', () => {
    cy.get('tbody tr').should('have.length.above', 2);
  });
});
