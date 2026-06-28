import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HCaptchaWidget } from "./hcaptcha-widget";

vi.mock("@/lib/envConstants", () => ({
  getHCaptchaSiteKey: () => "test-site-key",
  getEnvironment: () => "test",
  isHCaptchaEnabled: () => true
}));

describe("HCaptchaWidget", () => {
  it("renders without crashing", () => {
    const { container } = render(<HCaptchaWidget onVerify={vi.fn()} onExpire={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
