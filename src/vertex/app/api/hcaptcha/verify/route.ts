import { NextRequest, NextResponse } from 'next/server';
import { verifyHCaptchaToken, isHCaptchaConfigured } from '@/lib/hcaptcha';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    if (!isHCaptchaConfigured()) {
      logger.warn('hCaptcha not configured, accepting token');
      return NextResponse.json({ success: true });
    }

    const { token, remoteIp } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing hCaptcha token',
        },
        { status: 400 }
      );
    }

    const result = await verifyHCaptchaToken(token, remoteIp);

    if (!result.success) {
      logger.warn('hCaptcha verification failed', {
        errorCodes: result.error_codes,
        remoteIp,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'hCaptcha verification failed',
          errorCodes: result.error_codes,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('hCaptcha verification error', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
