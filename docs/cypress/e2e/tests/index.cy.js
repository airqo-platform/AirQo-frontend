/// <reference types="cypress" />

describe("Landing page", () => {
  it("Reachability test", () => {
    cy.visit("http://localhost:3000/#/");
  });
});
