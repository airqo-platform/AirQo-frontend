import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AccountPageLayout from '@/components/Account/Layout';
import Toast from '@/components/Toast';
import { registerInquiry } from '@/core/apis/Account';
import Link from 'next/link';
import Button from '@/components/Button';

const categoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Data', value: 'data' },
  { label: 'Feedback', value: 'feedback' },
  { label: 'Monitors', value: 'monitors' },
  { label: 'Partners', value: 'partners' },
  { label: 'Researchers', value: 'researchers' },
  { label: 'Policy', value: 'policy' },
  { label: 'Champions', value: 'champions' },
  { label: 'Developers', value: 'developers' },
  { label: 'Assistance', value: 'assistance' },
];

const DemoBooking = () => {
  const router = useRouter();

  // Form fields state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Loading and toast state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: '', message: '' });
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Enhanced email validation using a more robust regex pattern
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // Submit handler with basic validation before sending the request
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !fullName.trim() ||
      !email.trim() ||
      !message.trim() ||
      !selectedCategory
    ) {
      setToast({
        visible: true,
        type: 'error',
        message: 'Please fill in all required fields.',
      });
      return;
    }
    if (!validateEmail(email)) {
      setToast({
        visible: true,
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }
    if (!termsAgreed) {
      setToast({
        visible: true,
        type: 'error',
        message: 'You must agree to the Terms of Service and Privacy Policy.',
      });
      return;
    }

    setLoading(true);
    setToast({ visible: false, type: '', message: '' });

    // Prepare payload including the selected category
    const payload = {
      fullName,
      email,
      message,
      category: selectedCategory,
    };

    try {
      const response = await registerInquiry(payload);
      if (response.success) {
        // Clear the form fields
        setFullName('');
        setEmail('');
        setSelectedCategory('');
        setMessage('');
        setTermsAgreed(false);

        // Set the submission success state to true
        setSubmissionSuccess(true);
      } else {
        setToast({
          visible: true,
          type: 'error',
          message: response.error || 'Submission failed. Please try again.',
        });
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setToast({
        visible: true,
        type: 'error',
        message: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect for redirection after a successful submission with cleanup
  useEffect(() => {
    if (submissionSuccess) {
      const timer = setTimeout(() => {
        router.push('/account/creation/DemoBookingSuccess');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [submissionSuccess, router]);

  return (
    <AccountPageLayout
      childrenHeight={'lg:h-[680]'}
      childrenTop={'mt-20'}
      pageTitle={'Book a Demo | AirQo'}
    >
      <div className="w-full">
        <h2 className="text-3xl text-black-700 font-medium mb-4 text-start">
          Book a Demo Session
        </h2>
        <p className="text-xl text-black-700 font-normal mb-8 text-start">
          Fill out the form below to schedule a personalized demo session and
          learn how your organization can leverage AirQo’s air quality
          analytics.
        </p>

        {/* Display Toast message if any */}
        {toast.visible && (
          <Toast type={toast.type} timeout={8000} message={toast.message} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm text-black-700 font-semibold"
            >
              Full Name<span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-black-700 font-semibold"
            >
              Email Address<span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Category Select */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm text-black-700 font-semibold"
            >
              Category<span className="text-red-600">*</span>
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-blue-600"
              required
            >
              <option value="" disabled>
                Select your category
              </option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm text-black-700 font-semibold"
            >
              Your Message<span className="text-red-600">*</span>
            </label>
            <textarea
              id="message"
              placeholder="Enter your inquiry or any specific requirements"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-blue-600"
              rows="5"
              required
            ></textarea>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={termsAgreed}
              onChange={() => setTermsAgreed((prev) => !prev)}
              className="h-6 w-6 rounded border-gray-300 focus:ring-blue-600"
              required
            />
            <label htmlFor="terms" className="text-xs text-black-700">
              I agree to the{' '}
              <Link href="/terms-of-service" className="underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              type="submit"
              disabled={loading || !termsAgreed}
              className={`w-full text-sm outline-none border-none rounded-[12px] transition ${
                loading || !termsAgreed
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-blue-900 text-white hover:bg-blue-950'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Demo Request'}
            </Button>
          </div>
        </form>
      </div>
    </AccountPageLayout>
  );
};

export default DemoBooking;
