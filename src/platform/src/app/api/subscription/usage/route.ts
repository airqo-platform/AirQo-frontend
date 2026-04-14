import { NextResponse } from 'next/server';
import type { ApiUsage, SubscriptionTier } from '@/shared/types/api';
import {
  extractEnvelopeData,
  makeUsersApiRequest,
  parseJsonSafe,
} from '../_lib/paymentsProxy';

export const dynamic = 'force-dynamic';

interface UsersMePayload {
  subscriptionTier?: string;
  apiRateLimits?: {
    hourlyLimit?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
  } | null;
}

const DEFAULT_LIMITS_BY_TIER: Record<
  SubscriptionTier,
  { hourly: number; daily: number; monthly: number }
> = {
  Free: { hourly: 100, daily: 1000, monthly: 10000 },
  Standard: { hourly: 500, daily: 5000, monthly: 50000 },
  Premium: { hourly: 2000, daily: 20000, monthly: 200000 },
};

const normalizeTier = (tier?: string): SubscriptionTier => {
  const normalized = (tier || '').toLowerCase();
  if (normalized === 'standard') {
    return 'Standard';
  }
  if (normalized === 'premium') {
    return 'Premium';
  }
  return 'Free';
};

const getResetTime = (period: 'hourly' | 'daily' | 'monthly'): string => {
  const now = new Date();

  if (period === 'hourly') {
    const reset = new Date(now);
    reset.setHours(now.getHours() + 1, 0, 0, 0);
    return reset.toISOString();
  }

  if (period === 'daily') {
    const reset = new Date(now);
    reset.setDate(now.getDate() + 1);
    reset.setHours(0, 0, 0, 0);
    return reset.toISOString();
  }

  const reset = new Date(now);
  reset.setMonth(now.getMonth() + 1, 1);
  reset.setHours(0, 0, 0, 0);
  return reset.toISOString();
};

export async function GET() {
  try {
    const profileResult = await makeUsersApiRequest('/me', { method: 'GET' });

    if ('error' in profileResult) {
      return profileResult.error;
    }

    const payload = await parseJsonSafe<Record<string, unknown>>(
      profileResult.response
    );

    if (!profileResult.response.ok || !payload) {
      const message =
        (payload?.message as string | undefined) ||
        'Failed to retrieve usage statistics';

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: profileResult.response.status || 500 }
      );
    }

    const profile = extractEnvelopeData<UsersMePayload>(payload) || {};
    const tier = normalizeTier(profile.subscriptionTier);

    const fallbackLimits = DEFAULT_LIMITS_BY_TIER[tier];
    const usage: ApiUsage = {
      hourly: {
        used: 0,
        limit: profile.apiRateLimits?.hourlyLimit ?? fallbackLimits.hourly,
        resetTime: getResetTime('hourly'),
      },
      daily: {
        used: 0,
        limit: profile.apiRateLimits?.dailyLimit ?? fallbackLimits.daily,
        resetTime: getResetTime('daily'),
      },
      monthly: {
        used: 0,
        limit: profile.apiRateLimits?.monthlyLimit ?? fallbackLimits.monthly,
        resetTime: getResetTime('monthly'),
      },
    };

    return NextResponse.json({
      success: true,
      message: 'Usage statistics retrieved successfully',
      data: usage,
      usage,
    });
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve usage statistics',
      },
      { status: 500 }
    );
  }
}
