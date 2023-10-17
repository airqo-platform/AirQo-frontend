describe('DataTable', () => {
  beforeEach(() => {
    cy.visit('/analytics/collocation/collocate');
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

  it('allows selecting all devices', () => {
    cy.get('thead tr th input[type="checkbox"]').check();
    cy.get('tbody tr td input[type="checkbox"]').eq(2).check().should('be.checked');
  });

  it('allows selecting a device', () => {
    cy.get('tbody input[type="checkbox"]').first().check();
    cy.get('tbody input[type="checkbox"]').first().should('be.checked');
  });
});
