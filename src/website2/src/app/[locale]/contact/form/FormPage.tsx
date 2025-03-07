'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

import { CustomButton } from '@/components/ui';
import { postContactUs } from '@/services/externalService';

const FormPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | null>(null);

  // State for form data, loading, error, and success messages
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setCategory(categoryFromUrl);
  }, [searchParams]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      ...formData,
      category: category || 'general',
    };

    try {
      const response = await postContactUs(body);

      if (response.success) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          message: '',
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (err) {
      setError('Oops! Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Define motion variants for the form container
  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-green-100 p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold text-green-600">Success!</h2>
          <p className="text-gray-600">
            Your message has been sent successfully.
          </p>
          <CustomButton
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </CustomButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col lg:flex-row w-full bg-[#F9FAFB]"
      style={{ height: 'calc(100vh - 132px)' }}
    >
      {/* Contact Information Section */}
      <section className="flex-1 flex items-center justify-center bg-yellow-50 p-8 mb-8 lg:mb-0 lg:h-auto h-full">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">Get in touch</h2>
          <p className="text-lg font-semibold mb-4">Makerere University</p>
          <p className="text-gray-600 mb-2">
            Software Systems Centre, Block B, Level 3, College of Computing and
            Information Sciences, Plot 56 University Pool Road, Kampala, Uganda
          </p>
          <p className="text-lg mt-4">
            E:{' '}
            <a href="mailto:info@airqo.net" className="text-blue-600 underline">
              info@airqo.net
            </a>
          </p>
        </div>
      </section>

      {/* Form Section with Framer Motion */}
      <section className="flex-1 w-full flex flex-col justify-center p-8 bg-white">
        {/* Form */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          {/* Back Button */}
          <button
            onClick={() => {
              router.back();
              setFormData({
                fullName: '',
                email: '',
                message: '',
              });
              setError(null);
            }}
            className="mb-4 text-blue-600 hover:text-blue-800 transition-colors flex items-center focus:outline-none"
            aria-label="Go back to contact options"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>

          <form className="space-y-6 items-start" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex flex-col">
              <label htmlFor="fullName" className="mb-2 text-gray-600">
                Full name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="p-2 border-b border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#F9FAFB]"
                required
                aria-required="true"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 text-gray-600">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="p-2 border-b border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#F9FAFB]"
                required
                aria-required="true"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col">
              <label htmlFor="message" className="mb-2 text-gray-600">
                Your message*
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="p-2 border-b border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#F9FAFB]"
                required
                aria-required="true"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="mr-2 relative top-[5px]"
                required
                aria-required="true"
              />
              <label htmlFor="terms" className="text-gray-600">
                I agree to the{' '}
                <a
                  href="/terms"
                  className="text-blue-600 underline hover:text-blue-800 transition-colors"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-blue-600 underline hover:text-blue-800 transition-colors"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button with Hover and Tap Animations */}
            <CustomButton
              type="submit"
              className="bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors"
              aria-label="Submit contact form"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </CustomButton>
          </form>
        </motion.section>
      </section>
    </div>
  );
};

export default FormPage;
