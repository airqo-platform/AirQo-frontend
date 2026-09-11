import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import {
  CLAIM_TOKEN_EXPIRED_MESSAGE,
  CLAIM_TOKEN_MISMATCH_MESSAGE,
  DEVICE_ALREADY_CLAIMED_MESSAGE,
  DEVICE_NOT_FOUND_MESSAGE,
  getClaimErrorMessage,
  getClaimFailureMessage,
} from "./utils";

function axiosError(status: number, message: string): AxiosError {
  const error = new AxiosError(`Request failed with status code ${status}`);
  error.response = {
    status,
    statusText: "",
    data: { message },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

const axios404 = (message: string) => axiosError(404, message);
const axios400 = (message: string) => axiosError(400, message);

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

  it("maps a 409 to the already-claimed copy regardless of backend wording", () => {
    expect(
      getClaimErrorMessage(axiosError(409, "Device may have been claimed by another user."))
    ).toBe(DEVICE_ALREADY_CLAIMED_MESSAGE);
  });

  it("maps a 403 to the token-mismatch copy", () => {
    expect(getClaimErrorMessage(axiosError(403, "Claim token does not match"))).toBe(
      CLAIM_TOKEN_MISMATCH_MESSAGE
    );
  });

  it("maps a 410 to the expired-token copy", () => {
    expect(
      getClaimErrorMessage(
        axiosError(410, "This claim token has expired. Please contact support for a new one.")
      )
    ).toBe(CLAIM_TOKEN_EXPIRED_MESSAGE);
  });

  it("falls back to message matching when an older backend returns a generic 400", () => {
    expect(getClaimErrorMessage(axios400("Invalid claim token"))).toBe(
      CLAIM_TOKEN_MISMATCH_MESSAGE
    );
    expect(getClaimErrorMessage(axios400("Device is not available for claiming"))).toBe(
      DEVICE_ALREADY_CLAIMED_MESSAGE
    );
  });

  it("passes unrecognised backend messages through untouched", () => {
    expect(getClaimErrorMessage(axios400("user_id must be a valid MongoDB ObjectId"))).toBe(
      "user_id must be a valid MongoDB ObjectId"
    );
  });

  it("falls back to the generic message for non-API errors", () => {
    expect(getClaimErrorMessage(null)).toBe(
      "An unexpected error occurred. Please try again."
    );
  });
});

describe("getClaimFailureMessage", () => {
  it.each([
    ["Device not found", DEVICE_NOT_FOUND_MESSAGE],
    ["Device already claimed or not available", DEVICE_ALREADY_CLAIMED_MESSAGE],
    ["Invalid claim token", CLAIM_TOKEN_MISMATCH_MESSAGE],
    ["Claim token has expired", CLAIM_TOKEN_EXPIRED_MESSAGE],
  ])("maps the bulk-claim failure %j", (raw, expected) => {
    expect(getClaimFailureMessage(raw)).toBe(expected);
  });

  it("returns unknown failures unchanged", () => {
    expect(getClaimFailureMessage("The specified cohort does not belong to you")).toBe(
      "The specified cohort does not belong to you"
    );
  });
});
