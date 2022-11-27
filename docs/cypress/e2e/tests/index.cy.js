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
    cy.contains("Edit On GitHub").click();
    cy.on("url:changed", (newUrl) => {
      expect(newUrl).to.contain(
        "https://github.com/airqo-platform/AirQo-frontend/tree/staging/docs"
      );
    });
  });
});
