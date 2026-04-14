'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const fallbackPlans: SubscriptionPlan[] = [
  {
    tier: 'Free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      'Recent hourly measurements (7 days)',
      'Spatial heatmaps',
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
    features: [
      'Historical data access up to 1 year',
      'Raw sensor data and daily aggregations',
      'Bulk data exports',
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
    features: [
      '7-day hourly and daily forecasts',
      'Health recommendations',
      'Higher rate limits',
      'Priority support',
    ],
    limits: {
      hourly: 2000,
      daily: 20000,
      monthly: 200000,
    },
  },
];

const statusBadgeStyles: Record<string, string> = {
  active:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  past_due:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

const SubscriptionSection: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>(fallbackPlans);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [runningAction, setRunningAction] = useState<
    'checkout' | 'autoRenew' | 'cancel' | 'renew' | null
  >(null);

  const currentTier: SubscriptionTier = subscription?.tier || 'Free';
  const currentStatus = subscription?.status || 'inactive';
  const currentSubscriptionId = subscription?.currentSubscriptionId || '';

  const refreshData = useCallback(async () => {
    setLoading(true);

    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        subscriptionService.getSubscription(),
        subscriptionService.getPlans(),
      ]);

      if (subscriptionResponse.success) {
        const incoming =
          subscriptionResponse.subscription ||
          subscriptionResponse.data ||
          null;
        if (incoming) {
          setSubscription((incoming as UserSubscription) || null);
        }
      }

      const incomingPlans = plansResponse.plans;
      if (
        plansResponse.success &&
        Array.isArray(incomingPlans) &&
        incomingPlans.length
      ) {
        setPlans(incomingPlans);
      }
    } catch (error) {
      console.error('Error loading subscription view:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentPlan = useMemo(
    () => plans.find(plan => plan.tier === currentTier),
    [plans, currentTier]
  );

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedPlan) {
      return;
    }

    try {
      setRunningAction('checkout');

      const currentUrl = new URL(window.location.href);
      const successUrl = `${currentUrl.origin}${currentUrl.pathname}?tab=subscription&checkout=success`;
      const cancelUrl = `${currentUrl.origin}${currentUrl.pathname}?tab=subscription&checkout=cancel`;

      const payload = await subscriptionService.createCheckoutSession({
        tier: selectedPlan.tier,
        priceId: selectedPlan.priceId,
        successUrl,
        cancelUrl,
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
      console.error('Checkout error:', error);
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
    if (!currentSubscriptionId) {
      toast.error('No active subscription id found for this account');
      return;
    }

    try {
      setRunningAction('autoRenew');

      const payload = await subscriptionService.enableAutoRenewal(
        currentSubscriptionId
      );

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(
          payload.message || 'Failed to enable automatic renewal'
        );
      }

      setSubscription(prev =>
        prev
          ? {
              ...prev,
              automaticRenewal: true,
              autoRenewal: true,
            }
          : prev
      );
      toast.success(payload.message || 'Automatic renewal enabled');
    } catch (error) {
      console.error('Auto-renewal error:', error);
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
    if (!currentSubscriptionId) {
      toast.error('No active subscription id found for this account');
      return;
    }

    const confirmed = window.confirm(
      'Cancel your subscription now? You will retain access until the end of the current billing period.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setRunningAction('cancel');

      const payload = await subscriptionService.cancelSubscription(
        currentSubscriptionId
      );

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(payload.message || 'Failed to cancel subscription');
      }

      setSubscription(prev =>
        prev
          ? {
              ...prev,
              status: 'cancelled',
              automaticRenewal: false,
              autoRenewal: false,
            }
          : prev
      );
      toast.success(payload.message || 'Subscription cancelled');
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to cancel subscription'
      );
    } finally {
      setRunningAction(null);
    }
  };

  const handleRenewSubscription = async () => {
    if (!currentSubscriptionId) {
      toast.error('No active subscription id found for this account');
      return;
    }

    try {
      setRunningAction('renew');

      const payload = await subscriptionService.reactivateSubscription(
        currentSubscriptionId
      );

      if (!payload.success) {
        if (payload.comingSoon) {
          toast.warning(BILLING_SERVICE_UNAVAILABLE_MESSAGE);
          return;
        }

        throw new Error(payload.message || 'Failed to renew subscription');
      }

      toast.success(payload.message || 'Subscription renewed');
      await refreshData();
    } catch (error) {
      console.error('Renew subscription error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to renew subscription'
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
                  ? `${currentPlan.currency} ${currentPlan.price}/${currentPlan.price === 0 ? 'month' : 'month'}`
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
                {subscription?.apiRateLimits
                  ? `${subscription.apiRateLimits.hourlyLimit.toLocaleString()}/hr`
                  : 'Limits unavailable'}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            {!subscription?.automaticRenewal && currentSubscriptionId && (
              <Button
                variant="outlined"
                onClick={handleEnableAutoRenew}
                disabled={runningAction === 'autoRenew'}
                loading={runningAction === 'autoRenew'}
              >
                Enable Auto-Renew
              </Button>
            )}

            {currentSubscriptionId && currentStatus === 'active' && (
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

            {currentSubscriptionId &&
              (currentStatus === 'cancelled' ||
                currentStatus === 'past_due') && (
                <Button
                  onClick={handleRenewSubscription}
                  disabled={runningAction === 'renew'}
                  loading={runningAction === 'renew'}
                >
                  Renew Subscription
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

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {plans.map(plan => {
              const isCurrent = plan.tier === currentTier;
              const allowCheckout = !isCurrent && plan.tier !== 'Free';

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
                    <p>{plan.limits.monthly.toLocaleString()} requests/month</p>
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
                      ? 'Current plan'
                      : allowCheckout
                        ? `Upgrade to ${plan.name}`
                        : 'Unavailable'}
                  </Button>
                </Card>
              );
            })}
          </div>
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
