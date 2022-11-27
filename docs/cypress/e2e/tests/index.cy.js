/// <reference types="cypress" />

describe("hello world test", () => {
    //block of tests
    it("test home", ()=>{
        cy.visit("https://staging-docs.airqo.net/#/")
    })

    it("Verify ability to Search", ()=>{
        cy.get(".input-wrap  > input").type("AirQo")
    })
});
