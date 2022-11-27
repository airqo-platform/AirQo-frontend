/// <reference types="cypress" />

describe("hello world test", () => {
  //block of tests
  it("test home", () => {
    cy.visit("https://staging-docs.airqo.net/#/");
  });

  it("Verify AirQo logo is present and visible", () => {
    cy.get("section > .cover-main").eq(0).should("be.visible");
  });

  it("Verify Header is present", () => {
    cy.get("blockquote").first().should("be.exist");
  });

  it("Verify Side Bar menu sections exist", () => {
    cy.get(".sidebar > .search").should("be.exist");

    cy.get(".sidebar > .app-name").should("be.exist");

    cy.get(".sidebar > .sidebar-nav").should("be.exist");
  });
});
