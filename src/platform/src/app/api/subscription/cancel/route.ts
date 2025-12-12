import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';

/**
 * POST /api/subscription/cancel
 * Cancels the user's subscription (but keeps it active until end of billing period)
 */
export async function POST() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Replace with actual API call to AirQo payments service
    // POST /payments/subscriptions/{subscriptionId}/cancel endpoint
    // Based on the payment service documentation

    return NextResponse.json({
      success: true,
      message:
        'Subscription cancelled successfully. You will retain access until the end of your billing period.',
      subscription: {
        status: 'cancelled',
        autoRenewal: false,
      },
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to cancel subscription',
      },
      { status: 500 }
    );
  }
}
