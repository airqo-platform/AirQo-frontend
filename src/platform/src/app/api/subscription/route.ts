import { NextResponse } from 'next/server';
import type {
  ApiUsage,
  SubscriptionTier,
  UserSubscription,
} from '@/shared/types/api';
import {
  extractEnvelopeData,
  makeUsersApiRequest,
  makeUsersProfileRequest,
  parseJsonSafe,
} from './_lib/paymentsProxy';

export const dynamic = 'force-dynamic';

interface ApiRateLimitsPayload {
  hourlyLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

interface CurrentPlanDetailsPayload {
  priceId?: string | null;
  currency?: string | null;
  billingCycle?: string | null;
}

interface UsersMePayload {
  subscriptionTier?: string;
  subscriptionStatus?: string;
  nextBillingDate?: string | null;
  lastRenewalDate?: string | null;
  automaticRenewal?: boolean;
  currentSubscriptionId?: string | null;
  currentPlanDetails?: CurrentPlanDetailsPayload | null;
  apiRateLimits?: ApiRateLimitsPayload | null;
}

interface SubscriptionStatusPayload {
  status?: string;
  tier?: string;
  nextBillingDate?: string | null;
}

type UsersProfileEnvelope = UsersMePayload & {
  user?: UsersMePayload | null;
};

const DEFAULT_RATE_LIMITS: Record<
  SubscriptionTier,
  Required<ApiRateLimitsPayload>
> = {
  Free: {
    hourlyLimit: 100,
    dailyLimit: 1000,
    monthlyLimit: 10000,
  },
  Standard: {
    hourlyLimit: 500,
    dailyLimit: 5000,
    monthlyLimit: 50000,
  },
  Premium: {
    hourlyLimit: 2000,
    dailyLimit: 20000,
    monthlyLimit: 200000,
  },
};

const normalizeTier = (tier?: string): SubscriptionTier => {
  if (!tier) {
    return 'Free';
  }

  const normalized = tier.trim().toLowerCase();
  if (normalized === 'standard') {
    return 'Standard';
  }
  if (normalized === 'premium') {
    return 'Premium';
  }

  return 'Free';
};

const normalizeStatus = (
  status?: string
): 'active' | 'inactive' | 'past_due' | 'cancelled' => {
  if (!status) {
    return 'inactive';
  }

  const normalized = status.trim().toLowerCase();
  if (normalized === 'active') {
    return 'active';
  }
  if (normalized === 'past_due') {
    return 'past_due';
  }
  if (normalized === 'cancelled') {
    return 'cancelled';
  }

  return 'inactive';
};

const buildResetTime = (period: 'hourly' | 'daily' | 'monthly') => {
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

const toUsage = (rateLimits: Required<ApiRateLimitsPayload>): ApiUsage => {
  return {
    hourly: {
      used: 0,
      limit: rateLimits.hourlyLimit,
      resetTime: buildResetTime('hourly'),
    },
    daily: {
      used: 0,
      limit: rateLimits.dailyLimit,
      resetTime: buildResetTime('daily'),
    },
    monthly: {
      used: 0,
      limit: rateLimits.monthlyLimit,
      resetTime: buildResetTime('monthly'),
    },
  };
};

const resolveUsersProfilePayload = (
  payload: Record<string, unknown>
): UsersMePayload => {
  const envelope =
    extractEnvelopeData<UsersProfileEnvelope>(payload) ||
    ({} as UsersProfileEnvelope);

  if (envelope.user && typeof envelope.user === 'object') {
    return envelope.user;
  }

  return envelope;
};

export async function GET() {
  try {
    const usersMeResult = await makeUsersProfileRequest();

    if ('error' in usersMeResult) {
      return usersMeResult.error;
    }

    const usersMePayload = await parseJsonSafe<Record<string, unknown>>(
      usersMeResult.response
    );

    if (!usersMeResult.response.ok || !usersMePayload) {
      const message =
        (usersMePayload?.message as string | undefined) ||
        'Failed to retrieve subscription details';

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: usersMeResult.response.status || 500 }
      );
    }

    const profile = resolveUsersProfilePayload(usersMePayload);

    let tier = normalizeTier(profile.subscriptionTier);
    let status = normalizeStatus(profile.subscriptionStatus);
    let nextBillingDate = profile.nextBillingDate ?? null;

    const currentSubscriptionId = profile.currentSubscriptionId || null;
    if (currentSubscriptionId) {
      const statusResult = await makeUsersApiRequest(
        `/transactions/${encodeURIComponent(currentSubscriptionId)}/subscription-status`,
        {
          method: 'GET',
        }
      );

      if ('response' in statusResult && statusResult.response.ok) {
        const statusPayload = await parseJsonSafe<Record<string, unknown>>(
          statusResult.response
        );
        const statusData =
          extractEnvelopeData<SubscriptionStatusPayload>(statusPayload);

        if (statusData?.tier) {
          tier = normalizeTier(statusData.tier);
        }

        if (statusData?.status) {
          status = normalizeStatus(statusData.status);
        }

        if (statusData?.nextBillingDate !== undefined) {
          nextBillingDate = statusData.nextBillingDate ?? null;
        }
      }
    }

    const profileRateLimits = profile.apiRateLimits || {};
    const fallbackRateLimits = DEFAULT_RATE_LIMITS[tier];

    const rateLimits = {
      hourlyLimit:
        profileRateLimits.hourlyLimit ?? fallbackRateLimits.hourlyLimit,
      dailyLimit: profileRateLimits.dailyLimit ?? fallbackRateLimits.dailyLimit,
      monthlyLimit:
        profileRateLimits.monthlyLimit ?? fallbackRateLimits.monthlyLimit,
    };

    const subscription: UserSubscription = {
      tier,
      status,
      nextBillingDate,
      lastRenewalDate: profile.lastRenewalDate ?? null,
      automaticRenewal: Boolean(profile.automaticRenewal),
      currentSubscriptionId,
      currentPlanDetails: {
        priceId: profile.currentPlanDetails?.priceId ?? null,
        currency: profile.currentPlanDetails?.currency ?? null,
        billingCycle: profile.currentPlanDetails?.billingCycle ?? null,
      },
      apiRateLimits: rateLimits,
      // Backwards compatibility for older UI paths.
      autoRenewal: Boolean(profile.automaticRenewal),
      startDate: profile.lastRenewalDate || undefined,
      endDate: nextBillingDate || undefined,
      billingCycle:
        profile.currentPlanDetails?.billingCycle === 'annual'
          ? 'annual'
          : 'monthly',
    };

    const usage = toUsage(rateLimits);

    return NextResponse.json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: subscription,
      subscription,
      usage,
    });
  } catch (error) {
    console.error('Error fetching subscription overview:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve subscription details',
      },
      { status: 500 }
    );
  }
}
