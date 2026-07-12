import {
  buildDeviceImportCsvTemplate,
  downloadDeviceImportCsvTemplate,
  DEVICE_IMPORT_TEMPLATE_FILENAME,
} from "./csvTemplate";
import { EXPECTED_FIELDS } from "./types";

describe("buildDeviceImportCsvTemplate", () => {
  const lines = buildDeviceImportCsvTemplate().trimEnd().split("\n");
  const headers = lines[0].split(",");
  const example = lines[1].split(",");

  it("has a header row of every expected-field label, in order", () => {
    expect(headers).toEqual(EXPECTED_FIELDS.map((field) => field.label));
  });

  it("has exactly one example row with a value per column", () => {
    expect(lines).toHaveLength(2);
    expect(example).toHaveLength(headers.length);
  });

  it("fills every required field in the example row", () => {
    EXPECTED_FIELDS.forEach((field, index) => {
      if (field.required) {
        expect(example[index]).not.toBe("");
      }
    });
  });

  it("uses an accepted Authentication Required value", () => {
    const authIndex = EXPECTED_FIELDS.findIndex((f) => f.key === "authRequired");
    // Accepted truthy/falsy values enforced by the import modal's bulk transform.
    expect(["true", "1", "yes", "y", "false", "0", "no", "n"]).toContain(
      example[authIndex].toLowerCase()
    );
  });

  it("ends with a trailing newline so appended rows start clean", () => {
    expect(buildDeviceImportCsvTemplate().endsWith("\n")).toBe(true);
  });
});

describe("downloadDeviceImportCsvTemplate", () => {
  it("downloads the template under the expected filename", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    try {
      downloadDeviceImportCsvTemplate();

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toContain("text/csv");
      expect(click).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      expect(DEVICE_IMPORT_TEMPLATE_FILENAME).toMatch(/\.csv$/);
    } finally {
      click.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
