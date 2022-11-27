/// <reference types="cypress" />

describe("hello world test", () => {
  //block of tests
  it("test home", () => {
    cy.visit("https://staging-docs.airqo.net/#/");
  });

  it("Verify Edit On GitHub Button is clickable", () => {
    cy.contains("Edit On GitHub").click();
  });

  it("Verify Destination of Edit On Github button", () => {
    cy.get("article[id=main]>p>a").invoke("removeAttr", "target").click();
  });
});
