import { describe, it, expect, vi } from "vitest";
import { resolveCookieDomain } from "./authCookieDomain";

describe("resolveCookieDomain", () => {
  it("returns undefined when no cookie domain is configured", () => {
    expect(resolveCookieDomain(undefined, "https://vertex.airqo.net")).toBeUndefined();
  });

  it("keeps the configured domain when there is no reference URL to validate against", () => {
    expect(resolveCookieDomain(".airqo.net", undefined)).toBe(".airqo.net");
  });

  it.each(["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"])(
    "drops the configured domain for local host %s",
    (url) => {
      const warn = vi.fn();
      expect(resolveCookieDomain(".airqo.net", url, warn)).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    }
  );

  it("keeps the configured domain for hosts inside it", () => {
    expect(resolveCookieDomain(".airqo.net", "https://vertex.airqo.net")).toBe(".airqo.net");
    expect(resolveCookieDomain("airqo.net", "https://airqo.net")).toBe("airqo.net");
  });

  it("drops the domain and warns when the host is outside it", () => {
    const warn = vi.fn();
    expect(resolveCookieDomain(".airqo.net", "https://vertex.example.org", warn)).toBeUndefined();
    expect(warn).toHaveBeenCalledWith({
      kind: "host-mismatch",
      configuredCookieDomain: ".airqo.net",
      host: "vertex.example.org",
    });
  });

  it("drops the domain and warns when the reference URL is unparsable", () => {
    const warn = vi.fn();
    expect(resolveCookieDomain(".airqo.net", "not a url", warn)).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ kind: "invalid-reference-url" }));
  });
});
