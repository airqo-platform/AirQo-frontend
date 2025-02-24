<<<<<<< HEAD
'use client';
import React, { useState } from 'react';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { subscribeToNewsletter } from '@/services/externalService';

const NewsLetter: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
  const [loading, setLoading] = useState(false);

  // Form fields state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormStatus('idle');

    const formData = {
      email,
      firstName,
      lastName,
    };

    try {
      const response = await subscribeToNewsletter(formData);

      if (response.success) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      setFormStatus('error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-blue-50 py-28 px-4">
      <div
        className={`${mainConfig.containerClass} flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-12`}
      >
        {/* Header Section */}
        <div className="lg:w-1/2 text-center lg:text-left space-y-4">
          <h2 className="text-2xl md:text-[40px] font-bold text-blue-600">
            Get air quality updates!
          </h2>
          <p className="text-blue-600 text-[20px]">
            Subscribe to our newsletter and learn about the quality of the air
            you are breathing
          </p>
        </div>

        {/* Form Section */}
        {formStatus === 'success' ? (
          <div className="lg:w-1/2 text-center">
            <span role="img" aria-label="waving hand" className="text-4xl">
              👋
            </span>
            <p className="text-blue-600 text-[20px] mt-4">
              Thanks for joining...
            </p>
          </div>
        ) : formStatus === 'error' ? (
          <div className="lg:w-1/2 text-center">
            <span role="img" aria-label="sad face" className="text-4xl">
              😢
            </span>
            <p className="text-red-600 text-[20px] mt-4">
              Oops! Something went wrong. Please try again!
            </p>
          </div>
        ) : (
          <form
            className="lg:w-1/2 flex flex-col space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col md:flex-row md:space-x-4 w-full">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                className="max-w-[250px] md:max-w-full flex-1 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                className="max-w-[250px] md:max-w-full flex-1 p-3 outline-none focus:ring-2 focus:ring-blue-500 mt-4 md:mt-0"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:gap-0 md:flex w-full">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="max-w-[250px] md:max-w-full flex-grow p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <CustomButton
                type="submit"
                className="rounded-none"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Subscribe'}
              </CustomButton>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsLetter;
=======
'use client';
import React, { useEffect, useState } from 'react';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { subscribeToNewsletter } from '@/services/externalService';

const NewsLetter: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
  const [loading, setLoading] = useState(false);

  // Form fields state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFormStatus('idle');

    const formData = {
      email,
      firstName,
      lastName,
    };

    try {
      const response = await subscribeToNewsletter(formData);
      if (response.success) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error(error);
      setFormStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Reset the form for a new attempt (clears form fields)
  const handleReset = () => {
    setFormStatus('idle');
    setEmail('');
    setFirstName('');
    setLastName('');
  };

  // Auto-reset the form 5 seconds after a successful submission
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (formStatus === 'success') {
      timer = setTimeout(() => {
        handleReset();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [formStatus]);

  return (
    <section className="bg-blue-50 py-28 px-4">
      <div
        className={`${mainConfig.containerClass} flex flex-col items-center justify-center gap-12`}
      >
        {formStatus === 'idle' ? (
          // Split layout for idle state (header and form side-by-side on lg screens)
          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-12 w-full">
            <div className="lg:w-1/2 text-center lg:text-left space-y-4">
              <h2 className="text-2xl md:text-[40px] font-bold text-blue-600">
                Subscribe to our Newsletter
              </h2>
              <p className="text-blue-600 text-[20px]">
                Learn how we are advancing air quality management in African
                Cities
              </p>
            </div>
            <form
              className="lg:w-1/2 flex flex-col space-y-4 w-full max-w-md"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col md:flex-row md:space-x-4 w-full">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  className="w-full p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  className="w-full p-3 outline-none focus:ring-2 focus:ring-blue-500 mt-4 md:mt-0"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4 md:flex-row w-full">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CustomButton
                  type="submit"
                  className="rounded-none"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Subscribe'}
                </CustomButton>
              </div>
            </form>
          </div>
        ) : (
          // Single centered block for success or error state
          <div className="w-full max-w-md text-center space-y-4">
            {formStatus === 'success' ? (
              <>
                <span role="img" aria-label="waving hand" className="text-4xl">
                  👋
                </span>
                <p className="text-blue-600 text-[20px]">
                  Thank you for signing up. We will send you an email to confirm
                  your subscription shortly.
                </p>
              </>
            ) : (
              <>
                <span role="img" aria-label="sad face" className="text-4xl">
                  😢
                </span>
                <p className="text-red-600 text-[20px]">
                  Oops! Something went wrong. Please try again!
                </p>
                <CustomButton onClick={handleReset} className="rounded-none">
                  Try Again
                </CustomButton>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsLetter;
>>>>>>> f7a7ee4f1ba54f96646538966050053981e5657b
