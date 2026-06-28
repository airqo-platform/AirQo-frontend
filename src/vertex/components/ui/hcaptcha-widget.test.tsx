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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const MockHCaptcha = React.forwardRef(({ sitekey }: { sitekey: string }) => (
    <div data-testid="mock-hcaptcha" data-sitekey={sitekey} />
  ));
  MockHCaptcha.displayName = "MockHCaptcha";
  return { default: MockHCaptcha };
});

describe("HCaptchaWidget", () => {
  it("renders concrete captcha when enabled and site-key is present", () => {
    render(<HCaptchaWidget onVerify={vi.fn()} onExpire={vi.fn()} />);
    
    const hcaptchaElement = screen.getByTestId("mock-hcaptcha");
    expect(hcaptchaElement).toBeInTheDocument();
    expect(hcaptchaElement).toHaveAttribute("data-sitekey", "test-site-key");
  });
});
