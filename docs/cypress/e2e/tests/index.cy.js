/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page", () => {
  it("Verify page is reachable", () => {
    cy.visit("http://localhost:3000/#/");
  });

  it("Verify Edit On GitHub Button is clickable", () => {
    cy.contains("Edit On GitHub").click();
  });

  it("Verify Destination of Edit On Github button", () => {
    cy.get("article[id=main]>p>a").invoke("removeAttr", "target").click();

    cy.on("url:changed", (newUrl) => {
      expect(newUrl).to.contain(
        "https://github.com/airqo-platform/AirQo-frontend/blob/staging/docs"
      );
    });
  });
});
