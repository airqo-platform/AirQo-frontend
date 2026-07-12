import { EXPECTED_FIELDS } from "./types";
import type { ImportDeviceFormData } from "./types";

export const DEVICE_IMPORT_TEMPLATE_FILENAME = "vertex-device-import-template.csv";

/**
 * Example values keyed by field. Headers use the human-readable field labels
 * (the same labels shown in the Map Fields step), which the import modal's
 * auto-mapper recognises — so a filled-in template maps with zero manual work.
 */
const EXAMPLE_ROW: Partial<Record<keyof ImportDeviceFormData, string>> = {
  long_name: "Example Device 1",
  serial_number: "SN-0001",
  authRequired: "yes",
  latitude: "0.3476",
  longitude: "32.5825",
  api_code: "https://api.example.com/v1/device-1",
  description: "Optional free-text description",
  device_number: "123456",
};

const escapeCsvValue = (value: string): string =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/**
 * Builds the downloadable CSV template for bulk device import: a header row
 * of expected-field labels plus one example row users can overwrite.
 */
export function buildDeviceImportCsvTemplate(): string {
  const headers = EXPECTED_FIELDS.map((field) => field.label);
  const example = EXPECTED_FIELDS.map((field) => EXAMPLE_ROW[field.key] ?? "");

  return (
    [headers, example]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n") + "\n"
  );
}

/** Triggers a browser download of the CSV template. */
export function downloadDeviceImportCsvTemplate(): void {
  const blob = new Blob([buildDeviceImportCsvTemplate()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = DEVICE_IMPORT_TEMPLATE_FILENAME;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
