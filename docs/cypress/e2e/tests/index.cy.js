/// <reference types="cypress" />
import { ReplaceUrl } from "../../../utils/index";

describe("hello world test", () => {
  //block of tests
  it("test home", () => {
    cy.visit("https://staging-docs.airqo.net/#/");
  });

  it("Verify Edit On GitHub Button is clickable", () => {
    cy.contains("Edit On GitHub").click();
  });
});
