/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page", () => {
  it("test home", () => {
    cy.visit("https://staging-docs.airqo.net/");
  });

  it("Verify Side Menu Button is functional", () => {
    cy.get(".sidebar-toggle").click();
  });
});
