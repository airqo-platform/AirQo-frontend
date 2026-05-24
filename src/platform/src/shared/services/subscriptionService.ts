import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  ApiUsage,
  GetSubscriptionResponse,
  SubscriptionPlan,
  SubscriptionTier,
  Transaction,
  TransactionHistoryResponse,
  UserSubscription,
} from '../types/api';

type PrimitiveQueryValue = string | number | boolean;

interface ApiRateLimitsPayload {
  hourlyLimit?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
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
  user?: UsersMePayload | null;
}

interface SubscriptionStatusPayload {
  subscriptionStatus?: string;
  subscriptionTier?: string;
  status?: string;
  tier?: string;
  nextBillingDate?: string | null;
  automaticRenewal?: boolean;
  currentSubscriptionId?: string | null;
  apiRateLimits?: ApiRateLimitsPayload | null;
}

interface UsagePeriodPayload {
  used?: number | null;
  limit?: number | null;
  resetTime?: string | null;
}

interface UsagePayload {
  hourly?: UsagePeriodPayload | null;
  daily?: UsagePeriodPayload | null;
  monthly?: UsagePeriodPayload | null;
}

interface CheckoutRequest {
  userId: string;
  tier: SubscriptionTier;
  currency: string;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  comingSoon?: boolean;
  data?: {
    checkoutUrl?: string;
    sessionId?: string;
  };
}

interface MutationResponse {
  success: boolean;
  message: string;
  comingSoon?: boolean;
  data?: Record<string, unknown>;
}

type BackendTransaction = {
  _id?: string;
  id?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  paymentMethod?: string | { masked?: string; brand?: string; last4?: string };
  reference?: string;
  createdAt?: string;
  date?: string;
};

type NormalizedSubscriptionStatus = UserSubscription['status'];
type NormalizedRateLimits = NonNullable<UserSubscription['apiRateLimits']>;

const USERS_PROFILE_CANDIDATE_PATHS = ['/users/profile/enhanced'] as const;

const RETRYABLE_PROFILE_STATUSES = new Set([400, 404, 405]);

const isAbortError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;

  if (!candidate) {
    return false;
  }

  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
};

const getDefaultPlans = (): SubscriptionPlan[] => [
  {
    tier: 'Free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      'Recent hourly calibrated measurements (last 7 days)',
      'Access by Site ID, Device ID, Cohort ID, and Grid ID',
      'Spatial heatmap visualisations',
      'Community support',
    ],
    limits: {
      hourly: 100,
      daily: 1000,
      weekly: 7000,
      monthly: 10000,
    },
  },
  {
    tier: 'Standard',
    name: 'Standard',
    price: 50,
    currency: 'USD',
    priceId:
      process.env.NEXT_PUBLIC_PAYMENTS_STANDARD_PRICE_ID ||
      process.env.PAYMENTS_STANDARD_PRICE_ID,
    features: [
      'Everything in Free',
      'Historical data access up to 1 year',
      'Raw sensor data and daily aggregations',
      'Bulk data export with pagination support',
      'Email support',
    ],
    limits: {
      hourly: 500,
      daily: 5000,
      weekly: 35000,
      monthly: 50000,
    },
  },
  {
    tier: 'Premium',
    name: 'Premium',
    price: 150,
    currency: 'USD',
    priceId:
      process.env.NEXT_PUBLIC_PAYMENTS_PREMIUM_PRICE_ID ||
      process.env.PAYMENTS_PREMIUM_PRICE_ID,
    features: [
      'Everything in Standard',
      '7-day hourly and daily forecasts',
      'Health recommendations with forecast context',
      'Priority API access with higher limits',
      'Priority support',
    ],
    limits: {
      hourly: 2000,
      daily: 20000,
      weekly: 140000,
      monthly: 200000,
    },
  },
];

const getPlanRateLimits = (tier: SubscriptionTier): ApiRateLimitsPayload => {
  const plan =
    getDefaultPlans().find(plan => plan.tier === tier) || getDefaultPlans()[0];

  return {
    hourlyLimit: plan.limits.hourly,
    dailyLimit: plan.limits.daily,
    weeklyLimit: plan.limits.weekly,
    monthlyLimit: plan.limits.monthly,
  };
};

const mergeRateLimitsWithDefaults = (
  tier: SubscriptionTier,
  ...sources: Array<ApiRateLimitsPayload | null | undefined>
): ApiRateLimitsPayload => {
  const defaults = getPlanRateLimits(tier);
  const merged: ApiRateLimitsPayload = { ...defaults };

  sources.forEach(source => {
    if (!source) {
      return;
    }

    const hourlyLimit = normalizeNumber(source.hourlyLimit);
    if (hourlyLimit !== null) {
      merged.hourlyLimit = hourlyLimit;
    }

    const dailyLimit = normalizeNumber(source.dailyLimit);
    if (dailyLimit !== null) {
      merged.dailyLimit = dailyLimit;
    }

    const weeklyLimit = normalizeNumber(source.weeklyLimit);
    if (weeklyLimit !== null) {
      merged.weeklyLimit = weeklyLimit;
    }

    const monthlyLimit = normalizeNumber(source.monthlyLimit);
    if (monthlyLimit !== null) {
      merged.monthlyLimit = monthlyLimit;
    }
  });

  return merged;
};

const normalizeTier = (tier?: string): SubscriptionTier => {
  const normalized = (tier || '').trim().toLowerCase();

  if (normalized === 'standard') {
    return 'Standard';
  }

  if (normalized === 'premium') {
    return 'Premium';
  }

  return 'Free';
};

const normalizeStatus = (status?: string): NormalizedSubscriptionStatus => {
  const normalized = (status || '').trim().toLowerCase();

  if (normalized === 'active') {
    return 'active';
  }

  if (normalized === 'trialing') {
    return 'trialing';
  }

  if (normalized === 'past_due') {
    return 'past_due';
  }

  if (normalized === 'cancelled') {
    return 'cancelled';
  }

  return 'inactive';
};

const normalizeNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
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

const buildUsageFromRateLimits = (
  rateLimits?: ApiRateLimitsPayload | NormalizedRateLimits | null
): ApiUsage => ({
  hourly: {
    used: null,
    limit: normalizeNumber(rateLimits?.hourlyLimit),
    resetTime: buildResetTime('hourly'),
  },
  daily: {
    used: null,
    limit: normalizeNumber(rateLimits?.dailyLimit),
    resetTime: buildResetTime('daily'),
  },
  monthly: {
    used: null,
    limit: normalizeNumber(rateLimits?.monthlyLimit),
    resetTime: buildResetTime('monthly'),
  },
});

const normalizeUsagePeriod = (
  period: 'hourly' | 'daily' | 'monthly',
  payload: UsagePeriodPayload | null | undefined,
  fallbackLimit?: number | null
): ApiUsage['hourly'] => {
  const limit = normalizeNumber(payload?.limit);
  const used =
    payload?.used === null || payload?.used === undefined
      ? null
      : normalizeNumber(payload.used);

  return {
    used,
    limit: limit ?? fallbackLimit ?? null,
    resetTime:
      typeof payload?.resetTime === 'string' && payload.resetTime.trim()
        ? payload.resetTime
        : buildResetTime(period),
  };
};

const buildUsage = (
  payload?: UsagePayload | null,
  fallbackRateLimits?: ApiRateLimitsPayload | NormalizedRateLimits | null
): ApiUsage => ({
  hourly: normalizeUsagePeriod(
    'hourly',
    payload?.hourly,
    fallbackRateLimits?.hourlyLimit
  ),
  daily: normalizeUsagePeriod(
    'daily',
    payload?.daily,
    fallbackRateLimits?.dailyLimit
  ),
  monthly: normalizeUsagePeriod(
    'monthly',
    payload?.monthly,
    fallbackRateLimits?.monthlyLimit
  ),
});

const hasMissingUsageLimits = (usage: ApiUsage) =>
  usage.hourly.limit === null ||
  usage.daily.limit === null ||
  usage.monthly.limit === null;

const normalizeRateLimits = (
  rateLimits?: ApiRateLimitsPayload | null
): NormalizedRateLimits | undefined => {
  if (!rateLimits) {
    return undefined;
  }

  const hourlyLimit = normalizeNumber(rateLimits.hourlyLimit);
  const dailyLimit = normalizeNumber(rateLimits.dailyLimit);
  const monthlyLimit = normalizeNumber(rateLimits.monthlyLimit);
  const weeklyLimit = normalizeNumber(rateLimits.weeklyLimit);

  if (hourlyLimit === null || dailyLimit === null || monthlyLimit === null) {
    return undefined;
  }

  return {
    hourlyLimit,
    dailyLimit,
    monthlyLimit,
    ...(weeklyLimit !== null ? { weeklyLimit } : {}),
  };
};

const extractEnvelopeData = <T>(payload: unknown): T | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const envelope = payload as { data?: unknown };
  if (envelope.data === undefined) {
    return payload as T;
  }

  return envelope.data as T;
};

const extractArrayData = <T>(payload: unknown): T[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const envelope = payload as {
    data?: unknown;
    transactions?: unknown;
    items?: unknown;
    results?: unknown;
  };

  const candidates = [
    envelope.data,
    envelope.transactions,
    envelope.items,
    envelope.results,
    ...(envelope.data && typeof envelope.data === 'object'
      ? [
          (
            envelope.data as {
              transactions?: unknown;
              items?: unknown;
              results?: unknown;
            }
          ).transactions,
          (
            envelope.data as {
              transactions?: unknown;
              items?: unknown;
              results?: unknown;
            }
          ).items,
          (
            envelope.data as {
              transactions?: unknown;
              items?: unknown;
              results?: unknown;
            }
          ).results,
        ]
      : []),
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
};

const extractTransactionHistoryMeta = (
  payload: unknown
): TransactionHistoryResponse['meta'] | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const envelope = payload as {
    meta?: unknown;
    pagination?: unknown;
    data?: unknown;
  };

  const candidates = [
    envelope.meta,
    envelope.pagination,
    envelope.data && typeof envelope.data === 'object'
      ? (envelope.data as { meta?: unknown }).meta
      : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    const meta = candidate as {
      total?: unknown;
      page?: unknown;
      totalPages?: unknown;
      pages?: unknown;
      limit?: unknown;
    };

    const total = Number(meta.total);
    const page = Number(meta.page);
    const totalPages = Number(meta.totalPages ?? meta.pages);
    const limit = Number(meta.limit);

    if (
      Number.isFinite(total) &&
      Number.isFinite(page) &&
      Number.isFinite(totalPages) &&
      Number.isFinite(limit)
    ) {
      return {
        total,
        page,
        totalPages,
        limit,
      };
    }
  }

  return undefined;
};

const extractMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;
  const validationErrors = (() => {
    const errors = (payload as { errors?: unknown }).errors;

    if (!Array.isArray(errors)) {
      return [] as string[];
    }

    return errors
      .map(error => {
        if (typeof error === 'string') {
          return error.trim();
        }

        if (!error || typeof error !== 'object') {
          return '';
        }

        const candidate = error as {
          param?: unknown;
          field?: unknown;
          message?: unknown;
        };
        const param =
          typeof candidate.param === 'string' && candidate.param.trim()
            ? candidate.param.trim()
            : typeof candidate.field === 'string' && candidate.field.trim()
              ? candidate.field.trim()
              : '';
        const errorMessage =
          typeof candidate.message === 'string' && candidate.message.trim()
            ? candidate.message.trim()
            : '';

        if (param && errorMessage) {
          return `${param}: ${errorMessage}`;
        }

        return errorMessage || param;
      })
      .filter((item): item is string => Boolean(item));
  })();

  if (validationErrors.length) {
    const normalizedMessage =
      typeof message === 'string' ? message.trim().toLowerCase() : '';

    if (
      !normalizedMessage ||
      normalizedMessage.includes('bad request') ||
      normalizedMessage.includes('validation') ||
      normalizedMessage === 'errors'
    ) {
      return validationErrors.join('; ');
    }
  }

  return typeof message === 'string' && message.trim()
    ? message.trim()
    : fallback;
};

const isPaymentProviderUnavailable = (status: number, payload: unknown) => {
  if (status === 503) {
    return true;
  }

  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const envelope = payload as { status?: number; message?: string };
  const message = (envelope.message || '').toLowerCase();

  return (
    envelope.status === 503 ||
    message.includes('payment service is not configured') ||
    message.includes('payment provider is not configured') ||
    message.includes('service is not yet available')
  );
};

const normalizePaymentMethod = (
  paymentMethod: BackendTransaction['paymentMethod']
): string => {
  if (!paymentMethod) {
    return 'Provider-hosted checkout';
  }

  if (typeof paymentMethod === 'string') {
    return paymentMethod;
  }

  if (paymentMethod.masked) {
    return paymentMethod.masked;
  }

  if (paymentMethod.last4) {
    const brandPrefix = paymentMethod.brand ? `${paymentMethod.brand} ` : '';
    return `${brandPrefix}**** ${paymentMethod.last4}`;
  }

  return 'Provider-hosted checkout';
};

const normalizeTransactions = (items: unknown): Transaction[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const transaction = item as BackendTransaction;

    return {
      id: transaction._id || transaction.id || `txn-${index + 1}`,
      amount: Number(transaction.amount || 0),
      currency: transaction.currency || 'USD',
      status: transaction.status || 'pending',
      description: transaction.description || 'Subscription transaction',
      date:
        transaction.date || transaction.createdAt || new Date().toISOString(),
      paymentMethod: normalizePaymentMethod(transaction.paymentMethod),
      reference: transaction.reference,
    };
  });
};

const resolveUsersProfilePayload = (payload: unknown): UsersMePayload => {
  const envelope = extractEnvelopeData<UsersMePayload>(payload) || {};

  if (envelope.user && typeof envelope.user === 'object') {
    return envelope.user;
  }

  return envelope;
};

export class SubscriptionService {
  private readonly authenticatedClient: ApiClient;
  private resolvedUsersProfilePath:
    | (typeof USERS_PROFILE_CANDIDATE_PATHS)[number]
    | null = null;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  private withTenant(
    query: Record<string, PrimitiveQueryValue | undefined> = {}
  ): Record<string, PrimitiveQueryValue> {
    const params: Record<string, PrimitiveQueryValue> = {
      tenant: 'airqo',
    };

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params[key] = value;
    });

    return params;
  }

  private async getUsersProfilePayload(
    signal?: AbortSignal
  ): Promise<UsersMePayload> {
    await this.ensureAuthenticated();

    const orderedPaths = this.resolvedUsersProfilePath
      ? [
          this.resolvedUsersProfilePath,
          ...USERS_PROFILE_CANDIDATE_PATHS.filter(
            path => path !== this.resolvedUsersProfilePath
          ),
        ]
      : [...USERS_PROFILE_CANDIDATE_PATHS];

    let lastError: unknown = null;

    for (const profilePath of orderedPaths) {
      try {
        const response = await this.authenticatedClient.get<unknown>(
          profilePath,
          {
            params: this.withTenant(),
            signal,
          }
        );

        this.resolvedUsersProfilePath = profilePath;
        return resolveUsersProfilePayload(response.data);
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        const status =
          (error as { response?: { status?: number } })?.response?.status || 0;

        if (!RETRYABLE_PROFILE_STATUSES.has(status)) {
          throw error;
        }

        lastError = error;
      }
    }

    throw lastError || new Error('Unable to resolve user profile endpoint');
  }

  async getSubscription(): Promise<GetSubscriptionResponse> {
    const profile = await this.getUsersProfilePayload();

    let tier = normalizeTier(profile.subscriptionTier);
    let status = normalizeStatus(profile.subscriptionStatus);
    let nextBillingDate = profile.nextBillingDate ?? null;
    let automaticRenewal = Boolean(profile.automaticRenewal);
    let currentSubscriptionId = profile.currentSubscriptionId || null;
    let statusRateLimitsPayload: ApiRateLimitsPayload | null | undefined;

    try {
      const statusResponse = await this.authenticatedClient.get<unknown>(
        '/users/transactions/subscription-status',
        {
          params: this.withTenant(),
          validateStatus: status =>
            (status >= 200 && status < 300) ||
            status === 400 ||
            status === 404 ||
            status === 405,
        }
      );

      if (statusResponse.status < 200 || statusResponse.status >= 300) {
        statusRateLimitsPayload = undefined;
      } else {
        const statusData = extractEnvelopeData<SubscriptionStatusPayload>(
          statusResponse.data
        );

        const statusTier = statusData?.subscriptionTier ?? statusData?.tier;
        const statusValue =
          statusData?.subscriptionStatus ?? statusData?.status;

        if (statusTier) {
          tier = normalizeTier(statusTier);
        }

        if (statusValue) {
          status = normalizeStatus(statusValue);
        }

        if (statusData?.nextBillingDate !== undefined) {
          nextBillingDate = statusData.nextBillingDate ?? null;
        }

        if (typeof statusData?.automaticRenewal === 'boolean') {
          automaticRenewal = statusData.automaticRenewal;
        }

        if (statusData?.currentSubscriptionId !== undefined) {
          currentSubscriptionId = statusData.currentSubscriptionId ?? null;
        }

        statusRateLimitsPayload = statusData?.apiRateLimits;
      }
    } catch {
      // Fall back to profile details when status endpoint is unavailable.
    }

    const rateLimits = normalizeRateLimits(
      mergeRateLimitsWithDefaults(
        tier,
        profile.apiRateLimits,
        statusRateLimitsPayload
      )
    );

    const subscription: UserSubscription = {
      tier,
      status,
      nextBillingDate,
      lastRenewalDate: profile.lastRenewalDate ?? null,
      automaticRenewal,
      currentSubscriptionId,
      currentPlanDetails: {
        priceId: profile.currentPlanDetails?.priceId ?? null,
        currency: profile.currentPlanDetails?.currency ?? null,
        billingCycle: profile.currentPlanDetails?.billingCycle ?? null,
      },
      apiRateLimits: rateLimits,
      autoRenewal: automaticRenewal,
      startDate: profile.lastRenewalDate || undefined,
      endDate: nextBillingDate || undefined,
      billingCycle:
        profile.currentPlanDetails?.billingCycle === 'annual'
          ? 'annual'
          : 'monthly',
    };

    const usage = buildUsageFromRateLimits(rateLimits);

    return {
      success: true,
      message: 'Subscription retrieved successfully',
      data: {
        status,
        tier,
        nextBillingDate,
      },
      subscription,
      usage,
    };
  }

  async getUsage(options: { signal?: AbortSignal } = {}): Promise<{
    success: boolean;
    message: string;
    usage: ApiUsage;
    live: boolean;
  }> {
    let profile: UsersMePayload | null = null;

    const getFallbackRateLimits = async (): Promise<
      ApiRateLimitsPayload | undefined
    > => {
      if (!profile) {
        try {
          profile = await this.getUsersProfilePayload(options.signal);
        } catch (error) {
          if (isAbortError(error)) {
            throw error;
          }

          profile = null;
        }
      }

      return profile?.apiRateLimits ?? undefined;
    };

    try {
      await this.ensureAuthenticated();

      const response = await this.authenticatedClient.get<unknown>(
        '/users/transactions/usage',
        {
          params: this.withTenant(),
          signal: options.signal,
        }
      );

      const usagePayload = extractEnvelopeData<UsagePayload>(response.data);
      let fallbackRateLimits: ApiRateLimitsPayload | undefined;
      let usage = buildUsage(usagePayload);

      if (hasMissingUsageLimits(usage)) {
        fallbackRateLimits = await getFallbackRateLimits();
        usage = buildUsage(usagePayload, fallbackRateLimits);
      }

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Usage statistics retrieved successfully'
        ),
        usage,
        live: true,
      };
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      const fallbackRateLimits = await getFallbackRateLimits();

      return {
        success: true,
        message:
          'Live usage counters are temporarily unavailable. Showing your current plan limits instead.',
        usage: buildUsageFromRateLimits(fallbackRateLimits),
        live: false,
      };
    }
  }

  async getPlans(): Promise<{
    success: boolean;
    message: string;
    plans: SubscriptionPlan[];
  }> {
    return {
      success: true,
      message: 'Subscription plans retrieved successfully',
      plans: getDefaultPlans(),
    };
  }

  async createCheckoutSession(
    request: CheckoutRequest
  ): Promise<CheckoutResponse> {
    await this.ensureAuthenticated();

    const userId = request.userId.trim();
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required to create a checkout session',
      };
    }

    const tier = normalizeTier(request.tier);
    if (tier === 'Free') {
      return {
        success: false,
        message: 'Invalid subscription tier selected',
      };
    }

    const currency = request.currency.trim() || 'USD';

    const payload: Record<string, string> = {
      user_id: userId,
      tier,
      currency,
    };

    try {
      const response = await this.authenticatedClient.post<unknown>(
        '/users/transactions/checkout',
        payload,
        {
          params: this.withTenant(),
        }
      );

      const data = extractEnvelopeData<{
        checkoutUrl?: string;
        sessionId?: string;
        session_id?: string;
      }>(response.data);

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Checkout session created successfully'
        ),
        data: {
          checkoutUrl: data?.checkoutUrl,
          sessionId: data?.sessionId ?? data?.session_id,
        },
      };
    } catch (error) {
      const response = (
        error as { response?: { status?: number; data?: unknown } }
      ).response;
      const status = response?.status || 500;
      const errorPayload = response?.data;

      return {
        success: false,
        message: extractMessage(
          errorPayload,
          'Failed to create checkout session'
        ),
        comingSoon: isPaymentProviderUnavailable(status, errorPayload),
      };
    }
  }

  async enableAutoRenewal(): Promise<MutationResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.authenticatedClient.post<unknown>(
        '/users/transactions/enable-auto-renew',
        undefined,
        {
          params: this.withTenant(),
        }
      );

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Automatic renewal enabled successfully'
        ),
        data: {
          automaticRenewal: true,
        },
      };
    } catch (error) {
      const response = (
        error as { response?: { status?: number; data?: unknown } }
      ).response;
      const status = response?.status || 500;
      const errorPayload = response?.data;

      return {
        success: false,
        message: extractMessage(
          errorPayload,
          'Failed to enable automatic renewal'
        ),
        comingSoon: isPaymentProviderUnavailable(status, errorPayload),
      };
    }
  }

  async disableAutoRenewal(): Promise<MutationResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.authenticatedClient.post<unknown>(
        '/users/transactions/disable-auto-renew',
        undefined,
        {
          params: this.withTenant(),
        }
      );

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Automatic renewal disabled successfully'
        ),
        data: {
          automaticRenewal: false,
        },
      };
    } catch (error) {
      const response = (
        error as { response?: { status?: number; data?: unknown } }
      ).response;
      const status = response?.status || 500;
      const errorPayload = response?.data;

      return {
        success: false,
        message: extractMessage(
          errorPayload,
          'Failed to disable automatic renewal'
        ),
        comingSoon: isPaymentProviderUnavailable(status, errorPayload),
      };
    }
  }

  async cancelSubscription(): Promise<MutationResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.authenticatedClient.post<unknown>(
        '/users/transactions/cancel-subscription',
        undefined,
        {
          params: this.withTenant(),
        }
      );

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Subscription cancelled successfully'
        ),
        data: {
          status: 'cancelled',
          tier: 'Free',
          automaticRenewal: false,
          currentSubscriptionId: null,
        },
      };
    } catch (error) {
      const response = (
        error as { response?: { status?: number; data?: unknown } }
      ).response;
      const status = response?.status || 500;
      const errorPayload = response?.data;

      return {
        success: false,
        message: extractMessage(errorPayload, 'Failed to cancel subscription'),
        comingSoon: isPaymentProviderUnavailable(status, errorPayload),
      };
    }
  }

  async reactivateSubscription(): Promise<MutationResponse> {
    return {
      success: false,
      message:
        'Subscription reactivation is handled through checkout. Choose a paid plan to start a new subscription.',
    };
  }

  async getTransactionHistory(
    query: {
      start_date?: string;
      end_date?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<TransactionHistoryResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<unknown>(
      '/users/transactions/transaction-history',
      {
        params: this.withTenant({
          start_date: query.start_date,
          end_date: query.end_date,
          status: query.status,
          page: query.page ?? 1,
          limit: query.limit ?? 20,
        }),
      }
    );

    const rawTransactions = extractArrayData<BackendTransaction>(response.data);
    const transactions = normalizeTransactions(rawTransactions);
    const meta = extractTransactionHistoryMeta(response.data);

    return {
      success: true,
      message: extractMessage(
        response.data,
        'Transaction history retrieved successfully'
      ),
      data: transactions,
      transactions,
      ...(meta ? { meta } : {}),
    };
  }
}

export const subscriptionService = new SubscriptionService();
