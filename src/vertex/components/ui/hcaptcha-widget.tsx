"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { getHCaptchaSiteKey, getEnvironment, isHCaptchaEnabled } from "@/lib/envConstants";

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export interface HCaptchaWidgetHandle {
  reset: () => void;
}

export const HCaptchaWidget = forwardRef<HCaptchaWidgetHandle, HCaptchaWidgetProps>(
  function HCaptchaWidget({ onVerify, onExpire }, ref) {
    const siteKey = getHCaptchaSiteKey();
    const environment = getEnvironment();
    const captchaRef = useRef<HCaptcha>(null);

    useImperativeHandle(ref, () => ({
      reset: () => captchaRef.current?.resetCaptcha(),
    }));

    if (!isHCaptchaEnabled()) {
      return null;
    }

    if (!siteKey || siteKey.trim() === "") {
      return (
        <div className="p-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md my-2">
          {environment === 'development'
            ? 'HCaptcha site key is missing. Please set NEXT_PUBLIC_HCAPTCHA_SITE_KEY.'
            : 'Security check configuration is missing. Please contact support.'}
        </div>
      );
    }

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
