/// <reference types="cypress" />

describe("Verify AirQo Documentation Home Page", () => {

    it("test home", ()=>{
        cy.visit("https://staging-docs.airqo.net/")
    })
});
