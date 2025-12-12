'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner, toast } from '@/shared/components/ui';
import { AqEdit05 } from '@airqo/icons-react';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';

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

const BillingInformation: React.FC = () => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<BillingInfo>({});

  useEffect(() => {
    fetchBillingInfo();
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
        setEditing(false);
        toast.success('Billing information updated successfully');
      } else {
        toast.error(data.message || 'Failed to update billing information');
      }
    } catch (error) {
      console.error('Error updating billing info:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      // This would typically open a payment provider's interface (like Stripe Checkout)
      toast.info('Opening payment method setup...');
      // Redirect to payment setup or open modal
      window.location.href = '/api/payments/setup-payment-method';
    } catch (error) {
      console.error('Error setting up payment method:', error);
      toast.error(getUserFriendlyErrorMessage(error));
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
    <SettingsLayout
      title="Billing Information"
      description="Manage your payment methods and billing details"
    >
      <div className="space-y-6">
        {/* Payment Method */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Payment Method
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddPaymentMethod}
              Icon={AqEdit05}
            >
              {billingInfo?.paymentMethod ? 'Update' : 'Add Payment Method'}
            </Button>
          </div>

          {billingInfo?.paymentMethod ? (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {billingInfo.paymentMethod.brand?.toUpperCase() || 'CARD'}
                    </span>
                  </div>
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
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-dashed">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No payment method on file
                </p>
                <Button onClick={handleAddPaymentMethod}>
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
            {!editing && billingInfo?.billingAddress && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
                Icon={AqEdit05}
              >
                Edit
              </Button>
            )}
          </div>

          {editing ? (
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
                      setEditing(false);
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No billing address on file
                </p>
                <Button onClick={() => setEditing(true)}>
                  Add Billing Address
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default BillingInformation;
