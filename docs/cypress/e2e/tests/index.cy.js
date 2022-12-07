/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page", () => {

  it("Verify page is reachable", () => {
    cy.visit("http://localhost:3000/#/");
  });
  
  it("Verify Side Menu Button is functional", () => {
    cy.get(".sidebar-toggle").click();
  });

  it("Verify AirQo logo is present and visible", () => {
    cy.get("section > .cover-main").eq(0).should("be.visible");
  });

  it("Verify Header is present", () => {
    cy.get("blockquote")
      .first()
      .should("be.exist")
      .contains("Clean Air for all African Cities");
  });

  it("Verify GitHub Call-To-Action is functional", () => {
    cy.get('[href="https://github.com/airqo-platform"]').click();
  });

  it("Verify Explore Data Call-To-Action is functional", () => {
    cy.get('[href="https://airqo.net/explore-data"]').click();
  });

  it("Verify Side Bar menu sections exist", () => {
    cy.get(".sidebar > .search").should("be.exist");
    cy.get(".sidebar > .app-name").should("be.exist");
    cy.get(".sidebar > .sidebar-nav").should("be.exist");
  });

  it("Verify Side Bar Navigation menu Links are present", () => {
    cy.get("a[title='API']").first().should("be.exist");
    cy.get("a[title='Calibration']").first().should("be.exist");
    cy.get("a[title='Hardware']").first().should("be.exist");
    cy.get("a[title='Mobile App']").first().should("be.exist");
    cy.get("a[title='Platform']").first().should("be.exist");    
  });
it("Verify ability to Search", () => {
    cy.get(".input-wrap  > input").type("AirQo");
    cy.get(".results-panel").should(($lis) => {
      expect($lis.eq(0), "first item").to.contain("AirQo");
    });
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
