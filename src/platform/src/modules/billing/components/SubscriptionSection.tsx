'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '@/shared/components/ui';
import { AqCheck } from '@airqo/icons-react';
import { formatDate } from '@/shared/utils';
import type { UserSubscription, SubscriptionPlan } from '@/shared/types/api';
import CheckoutDialog from './CheckoutDialog';

const SubscriptionSection: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        // Fetch current subscription
        const subResponse = await fetch('/api/subscription');
        const subData = await subResponse.json();
        if (subData.success) {
          setSubscription(subData.subscription);
        }

        // Fetch available plans
        const plansResponse = await fetch('/api/subscription/plans');
        const plansData = await plansResponse.json();
        if (plansData.success) {
          setPlans(plansData.plans);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckoutDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Current Plan */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current plan</h3>
          {subscription ? (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💎</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {subscription.tier} Plan
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subscription.tier === 'Free'
                        ? 'Free forever'
                        : `$${subscription.tier === 'Standard' ? '29.99' : '79.99'}/month`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {subscription.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {subscription.tier !== 'Free' && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Next billing date
                    </span>
                    <span className="font-medium">
                      {formatDate(new Date(), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Billing cycle
                    </span>
                    <span className="font-medium capitalize">
                      {subscription.billingCycle}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                No active subscription
              </p>
            </Card>
          )}
        </div>

        {/* Plan Comparison */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose your plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <Card
                key={plan.name}
                className={`p-6 relative flex flex-col min-h-[400px] ${
                  subscription?.tier === plan.tier
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-lg transition-shadow'
                }`}
              >
                {subscription?.tier === plan.tier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                      Current plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h4>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                  {plan.tier === 'Free' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Free forever
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-sm">
                    <AqCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>{plan.limits.monthly} API calls per month</span>
                  </li>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <AqCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-auto"
                  variant={
                    subscription?.tier === plan.tier ? 'outlined' : 'filled'
                  }
                  onClick={() => handleUpgrade(plan)}
                  disabled={subscription?.tier === plan.tier}
                >
                  {subscription?.tier === plan.tier
                    ? 'Current plan'
                    : `Upgrade to ${plan.name}`}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <CheckoutDialog
        isOpen={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        plan={selectedPlan}
      />
    </>
  );
};

export default SubscriptionSection;
