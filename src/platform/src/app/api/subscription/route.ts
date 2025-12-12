import { NextResponse } from 'next/server';
import type { UserSubscription } from '@/shared/types/api';

// Dummy subscription data
const dummySubscription: UserSubscription = {
  tier: 'Free',
  status: 'active',
  startDate: '2025-01-01T00:00:00Z',
  autoRenewal: true,
  billingCycle: 'monthly',
};

export async function GET() {
  try {
    // In a real implementation, this would fetch from database
    // based on authenticated user
    const response = {
      success: true,
      message: 'Subscription retrieved successfully',
      subscription: dummySubscription,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve subscription' },
      { status: 500 }
    );
  }
}
