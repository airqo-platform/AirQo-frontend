'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Input, Select } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import type { SubscriptionPlan } from '@/shared/types/api';
import { countries } from 'countries-list';

// @ts-expect-error - React types mismatch between next/dynamic and react-google-recaptcha
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
});

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
  }, []);

  // Country options sorted alphabetically
  const countryOptions = useMemo(() => {
    return Object.values(countries)
      .map(c => ({ value: c.name, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Detect card type based on card number
  const detectCardType = (number: string): 'visa' | 'mastercard' | null => {
    const digits = number.replace(/\D/g, '');
    if (digits.startsWith('4')) return 'visa';
    if (
      /^5[1-5]/.test(digits) ||
      /^2[2-7]/.test(digits) ||
      /^222[1-9]/.test(digits) ||
      /^22[3-9]/.test(digits) ||
      /^2[3-6]/.test(digits) ||
      /^27[01]/.test(digits) ||
      /^2720/.test(digits)
    ) {
      return 'mastercard';
    }
    return null;
  };

  const cardType = detectCardType(cardNumber);

  const handleSubmit = async () => {
    if (!plan) return;

    // Check if reCAPTCHA is enabled
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    setIsProcessing(true);

    try {
      // Call actual payment API endpoint
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.tier,
          cardNumber,
          expiryDate,
          cvv,
          cardholderName,
          billingAddress: { fullName, country, addressLine1 },
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Payment failed');
      }

      toast.success(`Successfully upgraded to ${plan.name}!`);

      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setFullName('');
      setCountry('');
      setAddressLine1('');
      setRecaptchaToken(null);

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Payment failed. Please try again.'
      );
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      subtitle={plan ? `Upgrade to ${plan.name} - $${plan.price}/monthly` : ''}
      primaryAction={{
        label: isProcessing ? 'Processing...' : 'Complete Payment',
        onClick: handleSubmit,
        disabled:
          isProcessing ||
          !cardNumber ||
          !expiryDate ||
          !cvv ||
          !cardholderName ||
          !fullName ||
          !country ||
          !addressLine1,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <div className="space-y-6">
        {/* Payment Method Section */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Payment method
          </h3>

          <div className="space-y-4">
            <Input
              label="Cardholder Name"
              value={cardholderName}
              onChange={e => setCardholderName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={isProcessing}
            />

            {/* Card Number with Brand Icons */}
            <div className="relative">
              <Input
                label="Card number"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
                disabled={isProcessing}
              />
              <div className="absolute right-3 top-9 flex items-center gap-2">
                {/* Visa Icon */}
                <div
                  className={`transition-opacity ${
                    cardType === 'visa' ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <svg
                    width="32"
                    height="20"
                    viewBox="0 0 32 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rounded"
                  >
                    <rect width="32" height="20" rx="2" fill="#1434CB" />
                    <path
                      d="M13.8 14.5L15.3 6H17.5L16 14.5H13.8ZM23.7 6.2C23.2 6 22.4 5.8 21.4 5.8C19.2 5.8 17.6 6.9 17.6 8.5C17.6 9.7 18.7 10.3 19.5 10.7C20.4 11.1 20.7 11.3 20.7 11.7C20.7 12.3 20 12.5 19.3 12.5C18.3 12.5 17.8 12.4 17 12L16.6 11.8L16.2 14C16.8 14.3 17.8 14.5 18.9 14.5C21.2 14.5 22.8 13.4 22.8 11.7C22.8 10.7 22.2 10 20.8 9.4C20 9 19.6 8.8 19.6 8.4C19.6 8 20.1 7.6 21.1 7.6C21.9 7.6 22.5 7.7 23 8L23.3 8.1L23.7 6.2ZM27.1 6H25.4C24.8 6 24.4 6.2 24.1 6.8L20.8 14.5H23.1L23.6 13.1H26.4L26.7 14.5H28.7L27.1 6ZM24.3 11.1L25.4 8.3L26 11.1H24.3ZM12.7 6L10.6 12.4L10.4 11.3C10 9.9 8.7 8.4 7.3 7.6L9.3 14.5H11.6L15 6H12.7Z"
                      fill="white"
                    />
                    <path
                      d="M8.3 6H5.1L5 6.2C7.8 6.8 9.7 8.5 10.4 11.3L9.6 6.8C9.5 6.3 9.1 6 8.3 6Z"
                      fill="#FAA61A"
                    />
                  </svg>
                </div>

                {/* Mastercard Icon */}
                <div
                  className={`transition-opacity ${
                    cardType === 'mastercard' ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <svg
                    width="32"
                    height="20"
                    viewBox="0 0 32 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rounded"
                  >
                    <rect
                      width="32"
                      height="20"
                      rx="2"
                      fill="#252525"
                      fillOpacity="0.1"
                    />
                    <circle cx="12" cy="10" r="5" fill="#EB001B" />
                    <circle cx="20" cy="10" r="5" fill="#F79E1B" />
                    <path
                      d="M16 6.5C17.1 7.4 17.8 8.6 17.8 10C17.8 11.4 17.1 12.6 16 13.5C14.9 12.6 14.2 11.4 14.2 10C14.2 8.6 14.9 7.4 16 6.5Z"
                      fill="#FF5F00"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiration date"
                value={expiryDate}
                onChange={e => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                required
                disabled={isProcessing}
              />

              <div className="relative">
                <Input
                  label="Security code"
                  type="password"
                  value={cvv}
                  onChange={e =>
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="123"
                  maxLength={4}
                  required
                  disabled={isProcessing}
                />
                <div className="absolute right-3 top-9">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="16"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path d="M2 7H18" stroke="currentColor" strokeWidth="1.5" />
                    <text
                      x="10"
                      y="13"
                      fontSize="6"
                      fill="currentColor"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      123
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address Section */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Billing address
          </h3>

          <div className="space-y-4">
            <Input
              label="Full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={isProcessing}
            />

            <Select
              label="Country or region"
              value={country}
              onChange={e => setCountry(String(e.target.value))}
              placeholder="Select a country"
              required
              disabled={isProcessing}
            >
              <option value="">Select a country</option>
              {countryOptions.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>

            <Input
              label="Address line 1"
              value={addressLine1}
              onChange={e => setAddressLine1(e.target.value)}
              placeholder="Street address"
              required
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t">
          <p className="font-medium mb-2">Payment Summary</p>
          <div className="flex justify-between">
            <span>{plan?.name}</span>
            <span>${plan?.price} monthly</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${plan?.price} monthly</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Your payment information is secure and encrypted. We comply with PCI
          DSS standards.
        </div>

        {/* reCAPTCHA - Only show if site key is configured */}
        {RECAPTCHA_SITE_KEY ? (
          <div className="mt-4">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          </div>
        ) : (
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            ⚠️ reCAPTCHA not configured. Please add
            NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.
          </div>
        )}
      </div>
    </ReusableDialog>
  );
};

export default CheckoutDialog;
