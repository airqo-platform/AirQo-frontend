import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HCaptchaWidget } from "./hcaptcha-widget";
import React from "react";

vi.mock("@/lib/envConstants", () => ({
  getHCaptchaSiteKey: () => "test-site-key",
  getEnvironment: () => "test",
  isHCaptchaEnabled: () => true
}));

vi.mock("@hcaptcha/react-hcaptcha", () => {
  const React = require("react");
  return {
    default: React.forwardRef(({ sitekey }: any, ref: any) => (
      <div data-testid="mock-hcaptcha" data-sitekey={sitekey} />
    ))
  };
});

describe("HCaptchaWidget", () => {
  it("renders concrete captcha when enabled and site-key is present", () => {
    render(<HCaptchaWidget onVerify={vi.fn()} onExpire={vi.fn()} />);
    
    const hcaptchaElement = screen.getByTestId("mock-hcaptcha");
    expect(hcaptchaElement).toBeInTheDocument();
    expect(hcaptchaElement).toHaveAttribute("data-sitekey", "test-site-key");
  });
});
