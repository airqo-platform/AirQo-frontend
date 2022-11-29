/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page", () => {
  it("Verify page is reachable", () => {
    cy.visit("http://localhost:3000/#/");
  });

  it("Verify Side Menu Button is functional", () => {
    cy.get(".sidebar-toggle").click();
  });
});
