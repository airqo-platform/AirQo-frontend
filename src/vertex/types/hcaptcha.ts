/**
 * hCaptcha type definitions
 */

export interface HCaptchaToken {
  token: string;
  expiresAt: number;
}

export interface HCaptchaError {
  code: string;
  message: string;
}

export interface HCaptchaVerificationResult {
  success: boolean;
  token?: HCaptchaToken;
  error?: HCaptchaError;
}

export interface HCaptchaWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark';
  lang?: string;
}

export interface HCaptchaConfig {
  siteKey: string;
  secretKey: string;
  enabled: boolean;
}
