import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';

/**
 * PUT /api/subscription/auto-renewal
 * Toggles auto-renewal setting for the user's subscription
 */
export async function PUT(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { autoRenewal } = body;

    if (typeof autoRenewal !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Invalid autoRenewal value' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to AirQo payments service
    // PUT /payments/subscriptions/{subscriptionId}/auto-renewal endpoint
    // Based on the payment service documentation

    return NextResponse.json({
      success: true,
      message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'} successfully`,
      subscription: {
        autoRenewal,
      },
    });
  } catch (error) {
    console.error('Error toggling auto-renewal:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update auto-renewal setting',
      },
      { status: 500 }
    );
  }
}
