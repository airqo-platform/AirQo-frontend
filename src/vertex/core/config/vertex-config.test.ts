import { describe, it, expect } from "vitest";
import { validateVertexConfig, defaultVertexConfig, VertexConfigInput } from "./vertex-config";

describe("vertex-config", () => {
  describe("validateVertexConfig", () => {
    it("validates the default configuration successfully", () => {
      expect(() => validateVertexConfig(defaultVertexConfig)).not.toThrow();
      const result = validateVertexConfig(defaultVertexConfig);
      expect(result.org.name).toBe("Vertex Demo");
    });

    const validationCases = [
      {
        name: "fails on missing org name",
        modifier: (config: VertexConfigInput) => { config.org.name = ""; },
        expectedError: /org.name: Organization name is required/,
      },
      {
        name: "fails on invalid org slug",
        modifier: (config: VertexConfigInput) => { config.org.slug = "Invalid_Slug!"; },
        expectedError: /org.slug: Organization slug must use lowercase letters, numbers, and hyphens/,
      },
      {
        name: "fails on invalid hex color",
        modifier: (config: VertexConfigInput) => { config.org.primaryColor = "red"; },
        expectedError: /org.primaryColor: Primary color must be a valid hex color/,
      },
      {
        name: "fails on invalid support email",
        modifier: (config: VertexConfigInput) => { config.org.supportEmail = "not-an-email"; },
        expectedError: /org.supportEmail: Support email must be valid/,
      },
      {
        name: "fails when airqo adapter is used without baseUrl",
        modifier: (config: VertexConfigInput) => { 
          config.api.adapter = "airqo";
          config.api.baseUrl = "";
        },
        expectedError: /api.baseUrl: api.baseUrl is required when api.adapter is airqo/,
      },
      {
        name: "fails when airqo auth is used without airqo adapter",
        modifier: (config: VertexConfigInput) => { 
          config.auth.provider = "airqo";
          config.api.adapter = "mock";
        },
        expectedError: /auth.provider: auth.provider airqo requires api.adapter airqo/,
      },
      {
        name: "succeeds with airqo adapter and auth when baseUrl is provided",
        modifier: (config: VertexConfigInput) => { 
          config.api.adapter = "airqo";
          config.api.baseUrl = "https://api.airqo.net";
          config.auth.provider = "airqo";
        },
        expectedError: null,
      },
      {
        name: "fails on invalid map latitude",
        modifier: (config: VertexConfigInput) => { config.map.defaultCenter = [100, 0]; },
        expectedError: /map.defaultCenter: Map latitude must be between -90 and 90/,
      },
      {
        name: "fails on invalid map zoom",
        modifier: (config: VertexConfigInput) => { config.map.defaultZoom = 25; },
        expectedError: /map.defaultZoom: Number must be less than or equal to 22/,
      },
    ];

    it.each(validationCases)("validation: $name", ({ modifier, expectedError }) => {
      // Deep clone default config
      const testConfig: VertexConfigInput = JSON.parse(JSON.stringify(defaultVertexConfig));
      modifier(testConfig);

      if (expectedError) {
        expect(() => validateVertexConfig(testConfig)).toThrow(expectedError);
      } else {
        expect(() => validateVertexConfig(testConfig)).not.toThrow();
      }
    });
  });
});
