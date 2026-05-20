'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import { AqCheck } from '@airqo/icons-react';
import { Button, Card, LoadingSpinner, toast } from '@/shared/components/ui';
import { formatDate } from '@/shared/utils';
import { subscriptionService } from '@/shared/services/subscriptionService';
import type {
  SubscriptionPlan,
  SubscriptionTier,
  UserSubscription,
} from '@/shared/types/api';
import CheckoutDialog from './CheckoutDialog';

const BILLING_SERVICE_UNAVAILABLE_MESSAGE =
  'Billing service is temporarily unavailable. Please try again later.';

interface ExtendedSessionUser {
  _id?: string;
}

const statusBadgeStyles: Record<string, string> = {
  active:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  trialing: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  past_due:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

const formatRateLimitSummary = (
  rateLimits?: UserSubscription['apiRateLimits']
) => {
  if (!rateLimits) {
    return 'Limits unavailable';
  }

  return [
    `${rateLimits.hourlyLimit.toLocaleString()}/hr`,
    `${rateLimits.dailyLimit.toLocaleString()}/day`,
    typeof rateLimits.weeklyLimit === 'number'
      ? `${rateLimits.weeklyLimit.toLocaleString()}/week`
      : null,
    `${rateLimits.monthlyLimit.toLocaleString()}/month`,
  ]
    .filter(Boolean)
    .join(' | ');
};

const getBillingErrorLogMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && code.trim()) {
      return code.trim();
    }
  }

  return 'Unknown billing error';
};

const SubscriptionSection: React.FC = () => {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [runningAction, setRunningAction] = useState<
    'checkout' | 'enableAutoRenew' | 'disableAutoRenew' | 'cancel' | null
  >(null);
  const isMountedRef = useRef(true);
  const userId =
    (session?.user as ExtendedSessionUser | null)?._id?.trim() || '';

  const currentTier: SubscriptionTier = subscription?.tier || 'Free';
  const currentStatus = subscription?.status || 'inactive';

  const refreshData = useCallback(async () => {
    setLoading(true);

    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        subscriptionService.getSubscription(),
        subscriptionService.getPlans(),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setSubscription(
        subscriptionResponse.success
          ? (subscriptionResponse.subscription ?? null)
          : null
      );

      setPlans(
        plansResponse.success && Array.isArray(plansResponse.plans)
          ? plansResponse.plans
          : []
      );
    } catch (error) {
      console.error(
        `Error loading subscription view: ${getBillingErrorLogMessage(error)}`
      );
      toast.error('Failed to load subscription data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void refreshData();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshData]);

  const currentPlan = useMemo(
    () => plans.find(plan => plan.tier === currentTier),
    [plans, currentTier]
  );
  const hasPlans = plans.length > 0;
  const canManageAutoRenew =
    currentTier !== 'Free' &&
    (currentStatus === 'active' || currentStatus === 'trialing');
  const canCancelSubscription =
    currentTier !== 'Free' &&
    currentStatus !== 'inactive' &&
    currentStatus !== 'cancelled';

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedPlan) {
      return;
    }

    if (!userId) {
      toast.error(
        'Unable to determine the current user. Please refresh and try again.'
      );
      return;
    }

    try {
      setRunningAction('checkout');

      const payload = await subscriptionService.createCheckoutSession({
        userId,
        tier: selectedPlan.tier,
        currency: selectedPlan.currency?.trim() || 'USD',
      });

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(payload.message || 'Failed to create checkout session');
      }

      const checkoutUrl = payload?.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('Checkout session did not return a redirect URL');
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error(`Checkout error: ${getBillingErrorLogMessage(error)}`);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to start checkout right now'
      );
    } finally {
      setRunningAction(null);
      setDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleEnableAutoRenew = async () => {
    try {
      setRunningAction('enableAutoRenew');

      const payload = await subscriptionService.enableAutoRenewal();

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(
          payload.message || 'Failed to enable automatic renewal'
        );
      }

      await refreshData();
      toast.success(payload.message || 'Automatic renewal enabled');
    } catch (error) {
      console.error(`Auto-renewal error: ${getBillingErrorLogMessage(error)}`);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update automatic renewal'
      );
    } finally {
      setRunningAction(null);
    }
  };

  const handleDisableAutoRenew = async () => {
    const confirmed = window.confirm(
      'Disable auto-renewal? Your current plan will stay active until the next billing date, but it will not renew automatically.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setRunningAction('disableAutoRenew');

      const payload = await subscriptionService.disableAutoRenewal();

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(
          payload.message || 'Failed to disable automatic renewal'
        );
      }

      await refreshData();
      toast.success(payload.message || 'Automatic renewal disabled');
    } catch (error) {
      console.error(
        `Disable auto-renewal error: ${getBillingErrorLogMessage(error)}`
      );
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update automatic renewal'
      );
    } finally {
      setRunningAction(null);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      'Cancel your subscription now? This moves your account back to the Free tier immediately.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setRunningAction('cancel');

      const payload = await subscriptionService.cancelSubscription();

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(payload.message || 'Failed to cancel subscription');
      }

      await refreshData();
      toast.success(payload.message || 'Subscription cancelled');
    } catch (error) {
      console.error(
        `Cancel subscription error: ${getBillingErrorLogMessage(error)}`
      );
      toast.error(
        error instanceof Error ? error.message : 'Failed to cancel subscription'
      );
    } finally {
      setRunningAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10 pointer-events-none" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Active Access Tier
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {currentTier}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {currentPlan
                  ? `${currentPlan.currency} ${currentPlan.price}/month`
                  : 'Subscription status from your account profile'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeStyles[currentStatus] || statusBadgeStyles.inactive}`}
              >
                {currentStatus.replace('_', ' ')}
              </span>
              {subscription?.automaticRenewal && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                  Auto-renew enabled
                </span>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Next Billing Date
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {subscription?.nextBillingDate
                  ? formatDate(subscription.nextBillingDate, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not scheduled'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Last Renewal
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {subscription?.lastRenewalDate
                  ? formatDate(subscription.lastRenewalDate, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'No renewals yet'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Current Limits
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatRateLimitSummary(subscription?.apiRateLimits)}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            {canManageAutoRenew && !subscription?.automaticRenewal && (
              <Button
                variant="outlined"
                onClick={handleEnableAutoRenew}
                disabled={runningAction === 'enableAutoRenew'}
                loading={runningAction === 'enableAutoRenew'}
              >
                Enable Auto-Renew
              </Button>
            )}

            {canManageAutoRenew && subscription?.automaticRenewal && (
              <Button
                variant="outlined"
                onClick={handleDisableAutoRenew}
                disabled={runningAction === 'disableAutoRenew'}
                loading={runningAction === 'disableAutoRenew'}
              >
                Disable Auto-Renew
              </Button>
            )}

            {canCancelSubscription && (
              <Button
                variant="outlined"
                onClick={handleCancelSubscription}
                disabled={runningAction === 'cancel'}
                loading={runningAction === 'cancel'}
                className="border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Pricing Tiers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upgrade your API access based on your product and traffic needs.
          </p>

          {hasPlans ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {plans.map(plan => {
                const isCurrent = plan.tier === currentTier;
                const allowCheckout =
                  plan.tier !== 'Free' &&
                  (!isCurrent ||
                    currentStatus === 'past_due' ||
                    currentStatus === 'cancelled');
                const isUpgrade =
                  currentTier === 'Free' ||
                  (currentPlan ? plan.price > currentPlan.price : false);

                return (
                  <Card
                    key={plan.tier}
                    className={`p-5 flex flex-col ${
                      isCurrent
                        ? 'ring-2 ring-primary/60 border-primary/40'
                        : 'hover:shadow-md transition-shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {plan.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {plan.currency} {plan.price}/month
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 text-xs text-gray-700 dark:text-gray-300">
                      <p>{plan.limits.hourly.toLocaleString()} requests/hour</p>
                      <p>{plan.limits.daily.toLocaleString()} requests/day</p>
                      <p>{plan.limits.weekly.toLocaleString()} requests/week</p>
                      <p>
                        {plan.limits.monthly.toLocaleString()} requests/month
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2 flex-1">
                      {plan.features.map(feature => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <AqCheck className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-5"
                      variant={isCurrent ? 'outlined' : 'filled'}
                      disabled={!allowCheckout}
                      onClick={() => handleOpenCheckout(plan)}
                    >
                      {isCurrent
                        ? currentStatus === 'past_due'
                          ? 'Retry payment'
                          : currentStatus === 'cancelled'
                            ? 'Restart subscription'
                            : 'Current plan'
                        : allowCheckout
                          ? isUpgrade
                            ? `Upgrade to ${plan.name}`
                            : `Choose ${plan.name}`
                          : 'Unavailable'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-dashed border-gray-300 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400">
              Subscription plans are unavailable right now. Please refresh the
              page or try again later.
            </Card>
          )}
        </div>
      </div>

      <CheckoutDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        currentTier={currentTier}
        loading={runningAction === 'checkout'}
        onConfirm={handleCheckoutConfirm}
      />
    </>
  );
};

export default SubscriptionSection;
