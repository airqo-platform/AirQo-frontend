'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, LoadingSpinner, toast } from '@/shared/components/ui';
import Dialog from '@/shared/components/ui/dialog';
import { AqEdit05, AqAlertTriangle } from '@airqo/icons-react';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';
import dynamic from 'next/dynamic';

// @ts-expect-error - React types mismatch between next/dynamic and react-google-recaptcha
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
  loading: () => (
    <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
  ),
});

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

interface BillingInfo {
  paymentMethod?: {
    type: string;
    last4: string;
    brand?: string;
    expiryMonth?: string;
    expiryYear?: string;
  };
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  email?: string;
  name?: string;
}

interface Subscription {
  tier: string;
  status: string;
  startDate?: string;
  endDate?: string;
  autoRenewal: boolean;
  billingCycle?: string;
}

const BillingInformation: React.FC = () => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [updatingAutoRenewal, setUpdatingAutoRenewal] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [formData, setFormData] = useState<BillingInfo>({});
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
  }, []);

  useEffect(() => {
    fetchBillingInfo();
    fetchSubscription();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/billing-info');
      const data = await response.json();

      if (data.success) {
        setBillingInfo(data.billingInfo || {});
        setFormData(data.billingInfo || {});
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();

      if (data.success && data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/payments/billing-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setBillingInfo(data.billingInfo);
        setEditingAddress(false);
        toast.success('Billing information updated successfully');
      } else {
        toast.error(data.message || 'Failed to update billing information');
      }
    } catch (error) {
      console.error('Error updating billing info:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 19) {
      setPaymentFormData({ ...paymentFormData, cardNumber: value });
    }
  };

  const handleUpdatePaymentMethod = async () => {
    // Check if reCAPTCHA is enabled
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    if (!validateCardNumber(paymentFormData.cardNumber)) {
      toast.error('Invalid card number');
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYear = parseInt(paymentFormData.expiryYear, 10);
    const expiryMonth = parseInt(paymentFormData.expiryMonth, 10);

    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      toast.error('Card has expired');
      return;
    }

    try {
      setUpdatingPayment(true);

      const response = await fetch('/api/payments/update-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentFormData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment method updated successfully');
        setEditingPayment(false);
        fetchBillingInfo();
        setPaymentFormData({
          cardNumber: '',
          cardholderName: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
        });
        setRecaptchaToken(null);
      } else {
        toast.error(data.message || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleAutoRenewalToggle = async () => {
    if (!subscription) return;

    try {
      setUpdatingAutoRenewal(true);
      const newAutoRenewal = !subscription.autoRenewal;

      const response = await fetch('/api/subscription/auto-renewal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ autoRenewal: newAutoRenewal }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription({ ...subscription, autoRenewal: newAutoRenewal });
        toast.success(
          `Auto-renewal ${newAutoRenewal ? 'enabled' : 'disabled'} successfully`
        );
      } else {
        toast.error(data.message || 'Failed to update auto-renewal');
      }
    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setUpdatingAutoRenewal(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(prev =>
          prev ? { ...prev, status: 'cancelled', autoRenewal: false } : null
        );
        setCancelDialogOpen(false);
        toast.success(data.message || 'Subscription cancelled successfully');
      } else {
        toast.error(data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setCanceling(false);
    }
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
      <SettingsLayout
        title="Billing Information"
        description="Manage your payment methods, subscription, and billing details"
      >
        <div className="space-y-6">
          {/* Subscription Management */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Subscription Settings
            </h3>

            {subscription ? (
              <Card className="p-4">
                <div className="space-y-4">
                  {/* Auto Renewal Toggle */}
                  {subscription.status === 'active' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Auto-Renewal
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {subscription.autoRenewal
                            ? 'Your subscription will automatically renew'
                            : 'Your subscription will not renew automatically'}
                        </p>
                      </div>
                      <button
                        onClick={handleAutoRenewalToggle}
                        disabled={updatingAutoRenewal}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          subscription.autoRenewal
                            ? 'bg-primary'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        role="switch"
                        aria-checked={subscription.autoRenewal}
                        aria-label="Toggle auto-renewal"
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
                  )}

                  {/* Cancel Subscription Button */}
                  {subscription.status === 'active' && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outlined"
                        onClick={() => setCancelDialogOpen(true)}
                        className="!text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 !hover:text-red-600"
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  )}

                  {/* Cancelled Status Message */}
                  {subscription.status === 'cancelled' &&
                    subscription.endDate && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Your subscription has been cancelled and will remain
                          active until{' '}
                          {new Date(subscription.endDate).toLocaleDateString()}.
                        </p>
                      </div>
                    )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-dashed">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    No active subscription
                  </p>
                  <Button>View Plans</Button>
                </div>
              </Card>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Payment Method
              </h3>
              {!editingPayment && billingInfo?.paymentMethod && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingPayment(true)}
                  Icon={AqEdit05}
                >
                  Update
                </Button>
              )}
            </div>

            {editingPayment ? (
              <Card className="p-4">
                <div className="space-y-4">
                  {billingInfo?.paymentMethod && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Current card ending in {billingInfo.paymentMethod.last4}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formatCardNumber(paymentFormData.cardNumber)}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={paymentFormData.cardholderName}
                      onChange={e =>
                        setPaymentFormData({
                          ...paymentFormData,
                          cardholderName: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Month
                      </label>
                      <select
                        value={paymentFormData.expiryMonth}
                        onChange={e =>
                          setPaymentFormData({
                            ...paymentFormData,
                            expiryMonth: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0');
                          return (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year
                      </label>
                      <select
                        value={paymentFormData.expiryYear}
                        onChange={e =>
                          setPaymentFormData({
                            ...paymentFormData,
                            expiryYear: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 15 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentFormData.cvv}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            setPaymentFormData({
                              ...paymentFormData,
                              cvv: value,
                            });
                          }
                        }}
                        placeholder="123"
                        maxLength={4}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      🔒 Your payment information is encrypted and secure. We
                      never store your full card details.
                    </p>
                  </div>

                  {/* reCAPTCHA - Only show if site key is configured */}
                  {RECAPTCHA_SITE_KEY ? (
                    <div className="flex justify-center py-4">
                      <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={handleRecaptchaChange}
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ reCAPTCHA not configured. Please add
                        NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment
                        variables.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleUpdatePaymentMethod}
                      disabled={updatingPayment}
                      loading={updatingPayment}
                    >
                      {billingInfo?.paymentMethod ? 'Update Card' : 'Add Card'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditingPayment(false);
                        setPaymentFormData({
                          cardNumber: '',
                          cardholderName: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: '',
                        });
                        setRecaptchaToken(null);
                      }}
                      disabled={updatingPayment}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ) : billingInfo?.paymentMethod ? (
              <Card className="p-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {billingInfo.paymentMethod.type === 'card'
                        ? 'Credit/Debit Card'
                        : 'Payment Method'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      •••• •••• •••• {billingInfo.paymentMethod.last4}
                    </p>
                    {billingInfo.paymentMethod.expiryMonth &&
                      billingInfo.paymentMethod.expiryYear && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Expires {billingInfo.paymentMethod.expiryMonth}/
                          {billingInfo.paymentMethod.expiryYear}
                        </p>
                      )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-dashed">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    No payment method
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add a payment method to enable billing for your subscription
                  </p>
                  <Button onClick={() => setEditingPayment(true)}>
                    Add Payment Method
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Billing Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Billing Address
              </h3>
              {!editingAddress && billingInfo?.billingAddress && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingAddress(true)}
                  Icon={AqEdit05}
                >
                  Edit
                </Button>
              )}
            </div>

            {editingAddress ? (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.billingAddress?.line1 || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            line1: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.billingAddress?.line2 || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            line2: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress?.city || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            billingAddress: {
                              ...formData.billingAddress,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress?.state || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            billingAddress: {
                              ...formData.billingAddress,
                              state: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress?.postalCode || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            billingAddress: {
                              ...formData.billingAddress,
                              postalCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.billingAddress?.country || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            billingAddress: {
                              ...formData.billingAddress,
                              country: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleUpdate}>Save Changes</Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditingAddress(false);
                        setFormData(billingInfo || {});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ) : billingInfo?.billingAddress ? (
              <Card className="p-4">
                <div className="text-sm">
                  {billingInfo.name && (
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {billingInfo.name}
                    </p>
                  )}
                  {billingInfo.email && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {billingInfo.email}
                    </p>
                  )}
                  {billingInfo.billingAddress.line1 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {billingInfo.billingAddress.line1}
                    </p>
                  )}
                  {billingInfo.billingAddress.line2 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {billingInfo.billingAddress.line2}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    {[
                      billingInfo.billingAddress.city,
                      billingInfo.billingAddress.state,
                      billingInfo.billingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {billingInfo.billingAddress.country && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {billingInfo.billingAddress.country}
                    </p>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-dashed">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    No billing address
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add your billing address for accurate tax calculations and
                    invoice delivery
                  </p>
                  <Button onClick={() => setEditingAddress(true)}>
                    Add Billing Address
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </SettingsLayout>

      {/* Cancel Subscription Confirmation Dialog */}
      <Dialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        title="Cancel Subscription"
        icon={AqAlertTriangle}
        iconColor="text-red-600"
        iconBgColor="bg-red-100 dark:bg-red-900/30"
        size="md"
        primaryAction={{
          label: canceling ? 'Cancelling...' : 'Yes, Cancel Subscription',
          onClick: handleCancelSubscription,
          disabled: canceling,
          loading: canceling,
          className:
            'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50',
        }}
        secondaryAction={{
          label: 'Keep Subscription',
          onClick: () => setCancelDialogOpen(false),
          disabled: canceling,
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel your subscription? You will retain
            access to all features until the end of your current billing period.
          </p>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Your subscription will remain active until
              the end of your billing cycle. You can reactivate it anytime
              before then.
            </p>
          </div>

          {subscription?.tier !== 'Free' && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                After cancellation, you will be downgraded to the Free tier with
                limited features and API usage.
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default BillingInformation;
