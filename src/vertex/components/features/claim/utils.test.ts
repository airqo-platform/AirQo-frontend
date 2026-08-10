import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { DEVICE_NOT_FOUND_MESSAGE, getClaimErrorMessage } from "./utils";

function axios404(message: string): AxiosError {
  const error = new AxiosError("Request failed with status code 404");
  error.response = {
    status: 404,
    statusText: "Not Found",
    data: { message },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

function axios400(message: string): AxiosError {
  const error = new AxiosError("Request failed with status code 400");
  error.response = {
    status: 400,
    statusText: "Bad Request",
    data: { message },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe("getClaimErrorMessage", () => {
  it("replaces the backend's 404 copy with claim-specific guidance", () => {
    expect(getClaimErrorMessage(axios404("Device doesn't exist yet"))).toBe(
      DEVICE_NOT_FOUND_MESSAGE
    );
  });

  it("catches not-found wording even when the status is not 404", () => {
    expect(getClaimErrorMessage(axios400("This device does not exist"))).toBe(
      DEVICE_NOT_FOUND_MESSAGE
    );
  });

  it("passes other backend messages through untouched", () => {
    expect(getClaimErrorMessage(axios400("Invalid claim token"))).toBe(
      "Invalid claim token"
    );
  });

  it("falls back to the generic message for non-API errors", () => {
    expect(getClaimErrorMessage(null)).toBe(
      "An unexpected error occurred. Please try again."
    );
  });
});
