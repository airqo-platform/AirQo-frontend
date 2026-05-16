import { NextRequest, NextResponse } from 'next/server';
import { verifyHCaptchaToken, isHCaptchaConfigured } from '@/lib/hcaptcha';
import { logger } from '@/lib/logger';

/**
 * Extended login endpoint with hCaptcha verification
 * This is an example of how to integrate hCaptcha into your auth flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, hCaptchaToken } = body;

    // Step 1: Verify hCaptcha token if enabled
    if (isHCaptchaConfigured()) {
      if (!hCaptchaToken) {
        return NextResponse.json(
          {
            error: 'hCaptcha verification required',
            code: 'HCAPTCHA_REQUIRED',
          },
          { status: 400 }
        );
      }

      const clientIp =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        undefined;

      const hCaptchaResult = await verifyHCaptchaToken(hCaptchaToken, clientIp);

      if (!hCaptchaResult.success) {
        logger.warn('hCaptcha verification failed during login', {
          email,
          errorCodes: hCaptchaResult.error_codes,
        });

        return NextResponse.json(
          {
            error: 'Bot verification failed',
            code: 'HCAPTCHA_FAILED',
          },
          { status: 400 }
        );
      }
    }

    // Step 2: Proceed with normal authentication
    // Your existing auth logic here
    const authResult = {
      success: true,
      user: { email },
      message: 'Login successful',
    };

    return NextResponse.json(authResult);
  } catch (error) {
    logger.error('Login error', { error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
