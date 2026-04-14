import { NextRequest, NextResponse } from 'next/server';
import {
  extractEnvelopeData,
  isPaymentProviderUnavailable,
  makeUsersApiRequest,
  parseJsonSafe,
} from '../_lib/paymentsProxy';

export const dynamic = 'force-dynamic';

type CheckoutTier = 'Standard' | 'Premium';

interface CheckoutRequestBody {
  tier?: string;
  priceId?: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutResponseData {
  checkoutUrl?: string;
}

const resolveTier = (tier?: string): CheckoutTier | null => {
  const normalized = (tier || '').trim().toLowerCase();
  if (normalized === 'standard') {
    return 'Standard';
  }

  if (normalized === 'premium') {
    return 'Premium';
  }

  return null;
};

const resolvePriceId = (
  tier: CheckoutTier,
  explicitPriceId?: string
): string | null => {
  const candidate = explicitPriceId?.trim();
  if (candidate) {
    return candidate;
  }

  if (tier === 'Standard') {
    return (process.env.PAYMENTS_STANDARD_PRICE_ID || '').trim() || null;
  }

  return (process.env.PAYMENTS_PREMIUM_PRICE_ID || '').trim() || null;
};

const sanitizeRedirectUrl = (
  value: string | undefined,
  allowedOrigin: string,
  fallbackPath: string
): string => {
  const fallback = `${allowedOrigin}${fallbackPath}`;

  if (!value) {
    return fallback;
  }

  try {
    const parsed = new URL(value);
    if (parsed.origin !== allowedOrigin) {
      return fallback;
    }
    return parsed.toString();
  } catch {
    return fallback;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const tier = resolveTier(body.tier);

    if (!tier) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid subscription tier selected',
        },
        { status: 400 }
      );
    }

    const priceId = resolvePriceId(tier, body.priceId);
    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment configuration for this tier is not available yet',
          comingSoon: true,
        },
        { status: 503 }
      );
    }

    const requestOrigin = request.nextUrl.origin;
    const successUrl = sanitizeRedirectUrl(
      body.successUrl,
      requestOrigin,
      '/?tab=subscription&checkout=success'
    );
    const cancelUrl = sanitizeRedirectUrl(
      body.cancelUrl,
      requestOrigin,
      '/?tab=subscription&checkout=cancel'
    );

    const checkoutPayload: Record<string, string> = {
      tier,
      priceId,
      successUrl,
      cancelUrl,
    };

    if (body.customerId?.trim()) {
      checkoutPayload.customerId = body.customerId.trim();
    }

    const checkoutResult = await makeUsersApiRequest('/transactions/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutPayload),
    });

    if ('error' in checkoutResult) {
      return checkoutResult.error;
    }

    const checkoutPayloadResponse = await parseJsonSafe<
      Record<string, unknown>
    >(checkoutResult.response);

    const message =
      (checkoutPayloadResponse?.message as string | undefined) ||
      (checkoutResult.response.ok
        ? 'Checkout session created successfully'
        : 'Failed to create checkout session');

    if (
      isPaymentProviderUnavailable(
        checkoutResult.response.status,
        checkoutPayloadResponse
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message,
          comingSoon: true,
        },
        { status: 503 }
      );
    }

    if (!checkoutResult.response.ok || !checkoutPayloadResponse) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: checkoutResult.response.status || 500 }
      );
    }

    const data = extractEnvelopeData<CheckoutResponseData>(
      checkoutPayloadResponse
    );
    const checkoutUrl = data?.checkoutUrl;

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Checkout session did not return a redirect URL',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        checkoutUrl,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
