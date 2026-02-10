import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';

/**
 * POST /api/subscription/reactivate
 * Reactivates a cancelled subscription
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
    // POST /payments/subscriptions/{subscriptionId}/reactivate endpoint
    // Based on the payment service documentation

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        status: 'active',
        autoRenewal: true,
      },
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reactivate subscription',
      },
      { status: 500 }
    );
  }
}
