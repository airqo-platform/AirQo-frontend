"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export interface HCaptchaWidgetHandle {
  reset: () => void;
}

export const HCaptchaWidget = forwardRef<HCaptchaWidgetHandle, HCaptchaWidgetProps>(
  function HCaptchaWidget({ onVerify, onExpire }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
    const captchaRef = useRef<HCaptcha>(null);

    useImperativeHandle(ref, () => ({
      reset: () => captchaRef.current?.resetCaptcha(),
    }));

    if (!siteKey) return null;

    return (
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
      />
    );
  }
);
