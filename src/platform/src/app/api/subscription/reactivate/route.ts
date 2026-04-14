import { NextRequest, NextResponse } from 'next/server';
import {
  extractEnvelopeData,
  isPaymentProviderUnavailable,
  makeUsersApiRequest,
  parseJsonSafe,
} from '../_lib/paymentsProxy';

export const dynamic = 'force-dynamic';

interface RenewRequestBody {
  subscriptionId?: string;
}

interface UsersMePayload {
  currentSubscriptionId?: string | null;
}

const resolveSubscriptionId = async (
  request: NextRequest
): Promise<string | null> => {
  let subscriptionId = request.nextUrl.searchParams.get('subscriptionId') || '';

  try {
    const body = (await request.json()) as RenewRequestBody;
    subscriptionId = body.subscriptionId || subscriptionId;
  } catch {
    // Ignore body parsing errors and fallback to query/profile lookup.
  }

  subscriptionId = subscriptionId.trim();
  if (subscriptionId) {
    return subscriptionId;
  }

  const profileResult = await makeUsersApiRequest('/me', {
    method: 'GET',
  });

  if ('error' in profileResult) {
    return null;
  }

  const profilePayload = await parseJsonSafe<Record<string, unknown>>(
    profileResult.response
  );
  const profile = extractEnvelopeData<UsersMePayload>(profilePayload);

  return (profile?.currentSubscriptionId || '').trim() || null;
};

export async function POST(request: NextRequest) {
  try {
    const subscriptionId = await resolveSubscriptionId(request);

    if (!subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Subscription id is required to renew a subscription',
        },
        { status: 400 }
      );
    }

    const result = await makeUsersApiRequest(
      `/transactions/${encodeURIComponent(subscriptionId)}/renew-subscription`,
      {
        method: 'POST',
      }
    );

    if ('error' in result) {
      return result.error;
    }

    const payload = await parseJsonSafe<Record<string, unknown>>(
      result.response
    );
    const message =
      (payload?.message as string | undefined) ||
      (result.response.ok
        ? 'Subscription renewed successfully'
        : 'Failed to renew subscription');

    if (isPaymentProviderUnavailable(result.response.status, payload)) {
      return NextResponse.json(
        {
          success: false,
          message,
          comingSoon: true,
        },
        { status: 503 }
      );
    }

    if (!result.response.ok) {
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: result.response.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        status: 'active',
      },
      subscription: {
        status: 'active',
        automaticRenewal: true,
        autoRenewal: true,
      },
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to renew subscription',
      },
      { status: 500 }
    );
  }
}
