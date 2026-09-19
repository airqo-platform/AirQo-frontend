import { describe, it, expect, beforeEach } from "vitest";
import {
  getSiteDetailsReturnPath,
  rememberSiteDetailsReturnPath,
} from "./siteDetailsReturnPath";

function visit(pathAndQuery: string) {
  window.history.replaceState({}, "", pathAndQuery);
}

describe("siteDetailsReturnPath", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    visit("/");
  });

  it("returns the fallback when nothing was remembered", () => {
    expect(getSiteDetailsReturnPath("admin", "/admin/sites")).toBe("/admin/sites");
  });

  it("returns the remembered list page with its query string", () => {
    visit("/admin/sites?sites_search=kampala&sites_page=3");
    rememberSiteDetailsReturnPath();

    expect(getSiteDetailsReturnPath("admin", "/admin/sites")).toBe(
      "/admin/sites?sites_search=kampala&sites_page=3"
    );
  });

  it("returns a remembered non-list page such as a grid", () => {
    visit("/admin/grids/grid-1");
    rememberSiteDetailsReturnPath();

    expect(getSiteDetailsReturnPath("admin", "/admin/sites")).toBe("/admin/grids/grid-1");
  });

  it("ignores a page from the other area of the app", () => {
    visit("/admin/sites");
    rememberSiteDetailsReturnPath();
    expect(getSiteDetailsReturnPath("user", "/sites/overview")).toBe("/sites/overview");

    visit("/sites/my-sites");
    rememberSiteDetailsReturnPath();
    expect(getSiteDetailsReturnPath("admin", "/admin/sites")).toBe("/admin/sites");
    expect(getSiteDetailsReturnPath("user", "/sites/overview")).toBe("/sites/my-sites");
  });

  it("ignores values that are not same-origin paths", () => {
    for (const value of ["//evil.example/admin/sites", "https://evil.example", "admin/sites"]) {
      window.sessionStorage.setItem("vertex:site-details-return-path", value);
      expect(getSiteDetailsReturnPath("admin", "/admin/sites")).toBe("/admin/sites");
    }
  });
});
