import { AxiosError } from "axios";
import { getApiErrorMessage } from "./getApiErrorMessage";

const axiosError = (
  data: unknown,
  code?: string
): AxiosError & { isAxiosError: true } =>
  ({
    isAxiosError: true,
    name: "AxiosError",
    message: "Request failed",
    code,
    response: data === undefined ? undefined : { data },
  }) as AxiosError & { isAxiosError: true };

describe("getApiErrorMessage", () => {
  it("returns a timeout-specific message for aborted axios requests", () => {
    expect(getApiErrorMessage(axiosError(undefined, "ECONNABORTED"))).toBe(
      "Request timed out. Please check your connection and try again."
    );
  });

  it("extracts nested validation messages from axios error data", () => {
    expect(
      getApiErrorMessage(
        axiosError({ errors: { email: { msg: "Email is required" } } })
      )
    ).toBe("Email is required");
  });

  it("extracts array and string validation errors", () => {
    expect(
      getApiErrorMessage(axiosError({ errors: { name: ["Name is required"] } }))
    ).toBe("Name is required");
    expect(
      getApiErrorMessage(axiosError({ errors: { name: "Name is invalid" } }))
    ).toBe("Name is invalid");
  });

  it("extracts simple error messages and top-level messages", () => {
    expect(getApiErrorMessage(axiosError({ errors: "Unauthorized" }))).toBe(
      "Unauthorized"
    );
    expect(getApiErrorMessage(axiosError({ message: "Device not found" }))).toBe(
      "Device not found"
    );
  });

  it("extracts preserved backend payloads from custom Error data", () => {
    const error = Object.assign(new Error("Fallback"), {
      data: { errors: { message: "Backend message" } },
    });

    expect(getApiErrorMessage(error)).toBe("Backend message");
  });

  it("falls back when messages are empty or contain HTML", () => {
    expect(getApiErrorMessage(new Error("   "))).toBe(
      "An unexpected error occurred. Please try again."
    );
    expect(getApiErrorMessage(new Error("<html>Server error</html>"))).toBe(
      "An unexpected error occurred. Please try again."
    );
  });

  it("returns regular Error messages and a generic fallback for unknown input", () => {
    expect(getApiErrorMessage(new Error("Something broke"))).toBe(
      "Something broke"
    );
    expect(getApiErrorMessage({})).toBe(
      "An unexpected error occurred. Please try again."
    );
  });
});
