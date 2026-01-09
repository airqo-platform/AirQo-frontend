import { NextResponse } from 'next/server';
import type { SubscriptionPlan } from '@/shared/types/api';

// Dummy plans data
const dummyPlans: SubscriptionPlan[] = [
  {
    tier: 'Free',
    name: 'Free Plan',
    price: 0,
    currency: 'USD',
    features: [
      '10 API calls/hour',
      '100 API calls/day',
      '1000 API calls/month',
    ],
    limits: {
      hourly: 10,
      daily: 100,
      monthly: 1000,
    },
  },
  {
    tier: 'Standard',
    name: 'Standard Plan',
    price: 29.99,
    currency: 'USD',
    features: [
      '100 API calls/hour',
      '1000 API calls/day',
      '10000 API calls/month',
    ],
    limits: {
      hourly: 100,
      daily: 1000,
      monthly: 10000,
    },
  },
  {
    tier: 'Premium',
    name: 'Premium Plan',
    price: 79.99,
    currency: 'USD',
    features: [
      '500 API calls/hour',
      '5000 API calls/day',
      '50000 API calls/month',
      'Priority support',
    ],
    limits: {
      hourly: 500,
      daily: 5000,
      monthly: 50000,
    },
  },
];

export async function GET() {
  try {
    // In a real implementation, this would fetch from database
    const response = {
      success: true,
      message: 'Subscription plans retrieved successfully',
      plans: dummyPlans,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve subscription plans' },
      { status: 500 }
    );
  }
}
