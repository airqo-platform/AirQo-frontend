import { NextResponse } from 'next/server';
import type { UserSubscription, ApiUsage } from '@/shared/types/api';

// Helper function to get reset time based on period
const getResetTime = (period: 'hourly' | 'daily' | 'monthly'): string => {
  const now = new Date();
  let resetTime: Date;

  switch (period) {
    case 'hourly':
      resetTime = new Date(now);
      resetTime.setHours(now.getHours() + 1, 0, 0, 0);
      break;
    case 'daily':
      resetTime = new Date(now);
      resetTime.setDate(now.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      resetTime = new Date(now);
      resetTime.setMonth(now.getMonth() + 1, 1);
      resetTime.setHours(0, 0, 0, 0);
      break;
  }

  return resetTime.toISOString();
};

// Dummy subscription data
const dummySubscription: UserSubscription = {
  tier: 'Free',
  status: 'active',
  startDate: '2025-01-01T00:00:00Z',
  autoRenewal: true,
  billingCycle: 'monthly',
};

// Generate usage data based on subscription tier
const getUsageData = (tier: string): ApiUsage => {
  const limits = {
    Free: { hourly: 10, daily: 100, monthly: 1000 },
    Standard: { hourly: 100, daily: 1000, monthly: 10000 },
    Premium: { hourly: 1000, daily: 10000, monthly: 100000 },
  };

  const tierLimits = limits[tier as keyof typeof limits] || limits.Free;

  // Simulate realistic usage (between 30-70% of limit)
  const getRandomUsage = (limit: number) =>
    Math.floor(limit * (0.3 + Math.random() * 0.4));

  return {
    hourly: {
      used: getRandomUsage(tierLimits.hourly),
      limit: tierLimits.hourly,
      resetTime: getResetTime('hourly'),
    },
    daily: {
      used: getRandomUsage(tierLimits.daily),
      limit: tierLimits.daily,
      resetTime: getResetTime('daily'),
    },
    monthly: {
      used: getRandomUsage(tierLimits.monthly),
      limit: tierLimits.monthly,
      resetTime: getResetTime('monthly'),
    },
  };
};

export async function GET() {
  try {
    // In a real implementation, this would fetch from database
    // based on authenticated user
    const usage = getUsageData(dummySubscription.tier);

    const response = {
      success: true,
      message: 'Subscription retrieved successfully',
      subscription: dummySubscription,
      usage,
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
