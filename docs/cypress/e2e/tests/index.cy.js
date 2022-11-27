/// <reference types="cypress" />

describe("hello world test", () => {
  //block of tests
  it("test home", () => {
    cy.visit("https://staging-docs.airqo.net/#/");
  });

  it("Verify ability to Search", () => {
    cy.get(".input-wrap  > input").type("AirQo");
    cy.get(".results-panel").should(($lis) => {
      expect($lis.eq(0), "first item").to.contain("AirQo");
    });
  });
});
