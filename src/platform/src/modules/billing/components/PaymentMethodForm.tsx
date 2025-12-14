'use client';

import React, { useState, useCallback } from 'react';
import { Button, toast } from '@/shared/components/ui';
import Dialog from '@/shared/components/ui/dialog';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import dynamic from 'next/dynamic';

// @ts-expect-error - React types mismatch between next/dynamic and react-google-recaptcha
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
  loading: () => (
    <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
  ),
});

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingMethod?: {
    last4: string;
    brand?: string;
    expiryMonth?: string;
    expiryYear?: string;
  };
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingMethod,
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
  }, []);

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
      setFormData({ ...formData, cardNumber: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if reCAPTCHA is enabled
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    // Validate card number
    if (!validateCardNumber(formData.cardNumber)) {
      toast.error('Invalid card number');
      return;
    }

    // Validate expiry date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYear = parseInt(formData.expiryYear, 10);
    const expiryMonth = parseInt(formData.expiryMonth, 10);

    if (
      !Number.isFinite(expiryYear) ||
      !Number.isFinite(expiryMonth) ||
      expiryMonth < 1 ||
      expiryMonth > 12 ||
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      toast.error('Invalid expiry date');
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with Stripe Elements or Paystack hosted fields for tokenization
      // Do not send raw PAN and CVV to backend
      const response = await fetch('/api/payments/update-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentToken: 'token-from-provider', // Replace with actual token
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment method updated successfully');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          cardNumber: '',
          cardholderName: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
        });
      } else {
        toast.error(data.message || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
      setRecaptchaToken(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month.toString().padStart(2, '0');
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={existingMethod ? 'Update Payment Method' : 'Add Payment Method'}
      size="lg"
      showFooter={false}
      ariaLabel="Payment method form"
    >
      {existingMethod && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Current card ending in {existingMethod.last4}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={formatCardNumber(formData.cardNumber)}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.cardholderName}
            onChange={e =>
              setFormData({ ...formData, cardholderName: e.target.value })
            }
            placeholder="John Doe"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <select
              value={formData.expiryMonth}
              onChange={e =>
                setFormData({ ...formData, expiryMonth: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">MM</option>
              {months.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <select
              value={formData.expiryYear}
              onChange={e =>
                setFormData({ ...formData, expiryYear: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">YYYY</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setFormData({ ...formData, cvv: value });
                }
              }}
              placeholder="123"
              maxLength={4}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            🔒 Your payment information is encrypted and secure. We never store
            your full card details.
          </p>
        </div>

        {/* reCAPTCHA - Only show if site key is configured */}
        {RECAPTCHA_SITE_KEY ? (
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              theme="light"
            />
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ reCAPTCHA not configured. Please add
              NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={loading || (!!RECAPTCHA_SITE_KEY && !recaptchaToken)}
            className="flex-1"
            loading={loading}
          >
            {existingMethod ? 'Update Card' : 'Add Card'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default PaymentMethodForm;
