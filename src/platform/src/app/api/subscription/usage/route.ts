import { NextRequest, NextResponse } from 'next/server';
import type { ApiUsage } from '@/shared/types/api';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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

// Dummy usage data based on subscription tier
// In production, this would be fetched from the database
const getDummyUsage = (tier: string = 'Free'): ApiUsage => {
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

export async function GET(request: NextRequest) {
  try {
    // In a real implementation:
    // 1. Get user from auth session
    // 2. Fetch their subscription tier from database
    // 3. Fetch their actual API usage from logs/metrics

    const searchParams = request.nextUrl.searchParams;
    const tier = searchParams.get('tier') || 'Free';

    const usage = getDummyUsage(tier);

    return NextResponse.json({
      success: true,
      message: 'Usage statistics retrieved successfully',
      usage,
    });
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve usage statistics' },
      { status: 500 }
    );
  }
}
