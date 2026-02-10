'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner, toast } from '@/shared/components/ui';
import { formatDate } from '@/shared/utils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { UserSubscription } from '@/shared/types/api';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';

const SubscriptionManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');
      const data = await response.json();

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenewal = async () => {
    if (!subscription) return;

    try {
      setUpdating(true);
      const response = await fetch('/api/subscription/auto-renewal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoRenewal: !subscription.autoRenewal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(prev =>
          prev ? { ...prev, autoRenewal: !prev.autoRenewal } : null
        );
        toast.success(
          `Auto-renewal ${!subscription.autoRenewal ? 'enabled' : 'disabled'} successfully`
        );
      } else {
        toast.error(data.message || 'Failed to update auto-renewal');
      }
    } catch (error) {
      console.error('Error toggling auto-renewal:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? Your plan will remain active until the end of the current billing period.'
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(prev =>
          prev ? { ...prev, status: 'cancelled', autoRenewal: false } : null
        );
        toast.success(
          'Subscription cancelled. You can continue using your plan until the end of the billing period.'
        );
      } else {
        toast.error(data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(prev =>
          prev ? { ...prev, status: 'active', autoRenewal: true } : null
        );
        toast.success('Subscription reactivated successfully');
      } else {
        toast.error(data.message || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!subscription || subscription.tier === 'Free') {
    return (
      <SettingsLayout
        title="Subscription Management"
        description="Manage your subscription settings"
      >
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              You&apos;re on the Free Plan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upgrade to unlock more features and higher API limits
            </p>
            <Button onClick={() => (window.location.href = '#plans')}>
              View Plans
            </Button>
          </div>
        </Card>
      </SettingsLayout>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <SettingsLayout
      title="Subscription Management"
      description="Manage your subscription settings and preferences"
    >
      <div className="space-y-6">
        {/* Current Subscription Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {subscription.tier} Plan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Billing cycle: {subscription.billingCycle}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                subscription.status
              )}`}
            >
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </span>
          </div>

          <div className="space-y-4">
            {subscription.startDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subscription started
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(new Date(subscription.startDate), {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {subscription.endDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {subscription.status === 'cancelled'
                    ? 'Access until'
                    : 'Next billing date'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(new Date(subscription.endDate), {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Auto-Renewal Settings */}
        {subscription.status === 'active' && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Automatic Renewal
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.autoRenewal
                    ? 'Your subscription will automatically renew at the end of each billing period.'
                    : 'Your subscription will not renew automatically. You will need to manually renew before it expires.'}
                </p>
              </div>
              <div className="ml-4">
                <button
                  type="button"
                  onClick={handleToggleAutoRenewal}
                  disabled={updating}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    subscription.autoRenewal
                      ? 'bg-primary'
                      : 'bg-gray-200 dark:bg-gray-700'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="switch"
                  aria-checked={subscription.autoRenewal}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      subscription.autoRenewal
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Cancel/Reactivate Subscription */}
        <Card className="p-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {subscription.status === 'cancelled'
                ? 'Reactivate Subscription'
                : 'Cancel Subscription'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {subscription.status === 'cancelled'
                ? 'Reactivate your subscription to continue enjoying premium features.'
                : 'Cancel your subscription at any time. You will retain access until the end of your billing period.'}
            </p>
            {subscription.status === 'cancelled' ? (
              <Button
                onClick={handleReactivateSubscription}
                disabled={updating}
                variant="filled"
              >
                {updating ? 'Reactivating...' : 'Reactivate Subscription'}
              </Button>
            ) : (
              <Button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                variant="outlined"
                className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-950"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            )}
          </div>
        </Card>

        {/* Downgrade Notice */}
        {subscription.status === 'cancelled' && subscription.endDate && (
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Subscription Cancelled
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Your subscription has been cancelled and will not renew. You
                    can continue using your {subscription.tier} plan features
                    until{' '}
                    {formatDate(new Date(subscription.endDate), {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    . After that, you&apos;ll be downgraded to the Free plan.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </SettingsLayout>
  );
};

export default SubscriptionManagement;
