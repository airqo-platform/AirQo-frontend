import HCaptcha from "@hcaptcha/react-hcaptcha";

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function HCaptchaWidget({ onVerify, onExpire }: HCaptchaWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn("HCaptcha site key not configured");
    return null;
  }

  return (
    <HCaptcha
      sitekey={siteKey}
      onVerify={onVerify}
      onExpire={onExpire}
    />
  );
}
