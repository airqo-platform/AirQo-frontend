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
  status?: string;
  tier?: string;
  nextBillingDate?: string | null;
}

interface CheckoutRequest {
  tier: SubscriptionTier;
  priceId?: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  comingSoon?: boolean;
  data?: {
    checkoutUrl?: string;
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

const USERS_PROFILE_CANDIDATE_PATHS = [
  '/users/profile/enhanced',
  '/users/me',
] as const;

const RETRYABLE_PROFILE_STATUSES = new Set([400, 404, 405]);

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
      monthly: 200000,
    },
  },
];

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

const normalizeStatus = (
  status?: string
): 'active' | 'inactive' | 'past_due' | 'cancelled' => {
  const normalized = (status || '').trim().toLowerCase();

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

const toUsage = (rateLimits?: ApiRateLimitsPayload | null): ApiUsage => ({
  hourly: {
    used: null,
    limit: rateLimits?.hourlyLimit ?? null,
    resetTime: buildResetTime('hourly'),
  },
  daily: {
    used: null,
    limit: rateLimits?.dailyLimit ?? null,
    resetTime: buildResetTime('daily'),
  },
  monthly: {
    used: null,
    limit: rateLimits?.monthlyLimit ?? null,
    resetTime: buildResetTime('monthly'),
  },
});

const normalizeRateLimits = (
  rateLimits?: ApiRateLimitsPayload | null
):
  | {
      hourlyLimit: number;
      dailyLimit: number;
      monthlyLimit: number;
    }
  | undefined => {
  if (
    !rateLimits ||
    typeof rateLimits.hourlyLimit !== 'number' ||
    typeof rateLimits.dailyLimit !== 'number' ||
    typeof rateLimits.monthlyLimit !== 'number'
  ) {
    return undefined;
  }

  return {
    hourlyLimit: rateLimits.hourlyLimit,
    dailyLimit: rateLimits.dailyLimit,
    monthlyLimit: rateLimits.monthlyLimit,
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
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
};

const extractMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' && message.trim() ? message : fallback;
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

  private async getUsersProfilePayload(): Promise<UsersMePayload> {
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
          }
        );

        this.resolvedUsersProfilePath = profilePath;
        return resolveUsersProfilePayload(response.data);
      } catch (error) {
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

  private async resolveSubscriptionId(
    subscriptionId?: string
  ): Promise<string | null> {
    const trimmedInput = (subscriptionId || '').trim();
    if (trimmedInput) {
      return trimmedInput;
    }

    const profile = await this.getUsersProfilePayload();
    return (profile.currentSubscriptionId || '').trim() || null;
  }

  async getSubscription(): Promise<GetSubscriptionResponse> {
    const profile = await this.getUsersProfilePayload();

    let tier = normalizeTier(profile.subscriptionTier);
    let status = normalizeStatus(profile.subscriptionStatus);
    let nextBillingDate = profile.nextBillingDate ?? null;
    const currentSubscriptionId = profile.currentSubscriptionId || null;

    if (currentSubscriptionId) {
      try {
        const statusResponse = await this.authenticatedClient.get<unknown>(
          `/users/transactions/${encodeURIComponent(currentSubscriptionId)}/subscription-status`,
          {
            params: this.withTenant(),
          }
        );

        const statusData = extractEnvelopeData<SubscriptionStatusPayload>(
          statusResponse.data
        );

        if (statusData?.tier) {
          tier = normalizeTier(statusData.tier);
        }

        if (statusData?.status) {
          status = normalizeStatus(statusData.status);
        }

        if (statusData?.nextBillingDate !== undefined) {
          nextBillingDate = statusData.nextBillingDate ?? null;
        }
      } catch {
        // Fall back to profile details when status endpoint is unavailable.
      }
    }

    const rateLimits = profile.apiRateLimits ?? null;

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
      apiRateLimits: normalizeRateLimits(profile.apiRateLimits),
      autoRenewal: Boolean(profile.automaticRenewal),
      startDate: profile.lastRenewalDate || undefined,
      endDate: nextBillingDate || undefined,
      billingCycle:
        profile.currentPlanDetails?.billingCycle === 'annual'
          ? 'annual'
          : 'monthly',
    };

    const usage = toUsage(rateLimits);

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

  async getUsage(): Promise<{
    success: boolean;
    message: string;
    usage: ApiUsage;
  }> {
    const profile = await this.getUsersProfilePayload();
    const usage = toUsage(profile.apiRateLimits ?? null);

    return {
      success: true,
      message: 'Usage statistics retrieved successfully',
      usage,
    };
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

    const tier = normalizeTier(request.tier);
    if (tier === 'Free') {
      return {
        success: false,
        message: 'Invalid subscription tier selected',
      };
    }

    const payload: Record<string, string> = {
      tier,
    };

    if (request.priceId?.trim()) {
      payload.priceId = request.priceId.trim();
    }

    if (request.customerId?.trim()) {
      payload.customerId = request.customerId.trim();
    }

    if (request.successUrl?.trim()) {
      payload.successUrl = request.successUrl.trim();
    }

    if (request.cancelUrl?.trim()) {
      payload.cancelUrl = request.cancelUrl.trim();
    }

    try {
      const response = await this.authenticatedClient.post<unknown>(
        '/users/transactions/checkout',
        payload,
        {
          params: this.withTenant(),
        }
      );

      const data = extractEnvelopeData<{ checkoutUrl?: string }>(response.data);

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Checkout session created successfully'
        ),
        data: {
          checkoutUrl: data?.checkoutUrl,
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

  async enableAutoRenewal(subscriptionId?: string): Promise<MutationResponse> {
    await this.ensureAuthenticated();
    const resolvedSubscriptionId =
      await this.resolveSubscriptionId(subscriptionId);

    if (!resolvedSubscriptionId) {
      return {
        success: false,
        message: 'Subscription id is required to enable auto-renew',
      };
    }

    try {
      const response = await this.authenticatedClient.post<unknown>(
        `/users/transactions/${encodeURIComponent(resolvedSubscriptionId)}/enable-auto-renew`,
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

  async cancelSubscription(subscriptionId?: string): Promise<MutationResponse> {
    await this.ensureAuthenticated();
    const resolvedSubscriptionId =
      await this.resolveSubscriptionId(subscriptionId);

    if (!resolvedSubscriptionId) {
      return {
        success: false,
        message: 'Subscription id is required to cancel a subscription',
      };
    }

    try {
      const response = await this.authenticatedClient.post<unknown>(
        `/users/transactions/${encodeURIComponent(resolvedSubscriptionId)}/cancel-subscription`,
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
        message: extractMessage(errorPayload, 'Failed to cancel subscription'),
        comingSoon: isPaymentProviderUnavailable(status, errorPayload),
      };
    }
  }

  async reactivateSubscription(
    subscriptionId?: string
  ): Promise<MutationResponse> {
    await this.ensureAuthenticated();
    const resolvedSubscriptionId =
      await this.resolveSubscriptionId(subscriptionId);

    if (!resolvedSubscriptionId) {
      return {
        success: false,
        message: 'Subscription id is required to renew a subscription',
      };
    }

    try {
      const response = await this.authenticatedClient.post<unknown>(
        `/users/transactions/${encodeURIComponent(resolvedSubscriptionId)}/renew-subscription`,
        undefined,
        {
          params: this.withTenant(),
        }
      );

      return {
        success: true,
        message: extractMessage(
          response.data,
          'Subscription renewed successfully'
        ),
        data: {
          status: 'active',
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
        message: extractMessage(errorPayload, 'Failed to renew subscription'),
        comingSoon: isPaymentProviderUnavailable(status, errorPayload),
      };
    }
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

    return {
      success: true,
      message: extractMessage(
        response.data,
        'Transaction history retrieved successfully'
      ),
      data: transactions,
      transactions,
    };
  }
}

export const subscriptionService = new SubscriptionService();
