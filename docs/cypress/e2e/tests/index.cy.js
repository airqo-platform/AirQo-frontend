/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page is functional", () => {
  it("test home", () => {
    cy.visit("http://localhost:3000/#/");
  });

  it("Verify Side Menu Button is functional", () => {
    cy.get(".sidebar-toggle").click();
  });
});
