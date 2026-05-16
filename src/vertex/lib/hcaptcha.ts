/**
 * hCaptcha Foundation Integration Service
 * Provides bot protection through hCaptcha verification
 */

import { logger } from './logger';

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/99checksite';
const HCAPTCHA_SITE_VERIFY_URL = 'https://hcaptcha.com/checksiteconfig';

export interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  error_codes?: string[];
}

export interface HCaptchaConfig {
  siteKey: string;
  secretKey: string;
  enabled: boolean;
}

/**
 * Get hCaptcha configuration from environment variables
 */
export function getHCaptchaConfig(): HCaptchaConfig {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';
  const secretKey = process.env.HCAPTCHA_SECRET_KEY || '';
  const enabled = process.env.NEXT_PUBLIC_HCAPTCHA_ENABLED === 'true';

  return {
    siteKey,
    secretKey,
    enabled,
  };
}

/**
 * Verify hCaptcha token with hCaptcha API
 * @param token - The hCaptcha response token
 * @param remoteIp - Optional remote IP address
 * @returns Verification result
 */
export async function verifyHCaptchaToken(
  token: string,
  remoteIp?: string
): Promise<HCaptchaVerifyResponse> {
  const config = getHCaptchaConfig();

  if (!config.enabled) {
    logger.warn('hCaptcha is disabled, skipping verification');
    return { success: true };
  }

  if (!config.secretKey) {
    logger.error('hCaptcha secret key not configured');
    return {
      success: false,
      error_codes: ['missing_secret'],
    };
  }

  try {
    const params = new URLSearchParams({
      response: token,
      secret: config.secretKey,
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      logger.error('hCaptcha verification request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return {
        success: false,
        error_codes: ['internal_error'],
      };
    }

    const result = await response.json();

    if (!result.success) {
      logger.warn('hCaptcha verification failed', {
        errorCodes: result.error_codes,
      });
    }

    return result;
  } catch (error) {
    logger.error('hCaptcha verification error', { error });
    return {
      success: false,
      error_codes: ['internal_error'],
    };
  }
}

/**
 * Check if hCaptcha is properly configured
 */
export function isHCaptchaConfigured(): boolean {
  const config = getHCaptchaConfig();
  return !!(config.enabled && config.siteKey && config.secretKey);
}

/**
 * Get the hCaptcha site key for client-side use
 */
export function getHCaptchaSiteKey(): string | null {
  const config = getHCaptchaConfig();
  return config.enabled ? config.siteKey : null;
}
