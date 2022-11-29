/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page", () => {
  it("Verify page is reachable", () => {
    cy.visit("http://localhost:3000/#/");
  });

  it("Verify ability to Search", () => {
    cy.get(".input-wrap  > input").type("AirQo");
    cy.get(".results-panel").should(($lis) => {
      expect($lis.eq(0), "first item").to.contain("AirQo");
    });
  });
});
