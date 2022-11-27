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
});
