// Verifies the organisation cohort id
import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import ProgressComponent from '@/components/Account/ProgressComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { verifyCohortID } from '@/core/apis/DeviceRegistry';
import { registerInquiry } from '@/core/apis/Inquiry';
import DialogWrapper from '@/components/Modal/DialogWrapper';

const ContactAdminModal = ({ open, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && email.match(emailRegex)) {
      return true;
    }

    return false;
  };

  const clearForm = () => {
    setFullName('');
    setEmail('');
    setMessage('');
  };

  const handleContactAdmin = async () => {
    if (fullName === '' || email === '' || message === '') {
      setErrorMessage('Please fill in all fields');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await registerInquiry({
        fullName,
        email,
        message,
        category: 'assistance',
      });
      if (response.success) {
        setSuccessMessage('Your inquiry has been sent!');

        setTimeout(() => {
          setSuccessMessage('');
          clearForm();
          onClose();
        }, 3000);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error &&
          error.response &&
          error.response.data &&
          error.response.data.message,
      );
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <DialogWrapper
      handleClick={() => handleContactAdmin()}
      open={open}
      onClose={onClose}
      loading={loading}
    >
      <div>
        <div className="flex justify-between items-center">
          <h2 className="self-stretch text-gray-700 text-lg font-medium leading-relaxed">
            Contact Admin Support
          </h2>
        </div>
        <div className="mt-4">
          <div className="w-full">
            <div className="text-sm text-secondary-neutral-light-600">
              Full Name
            </div>
            <div className="mt-2 w-full">
              <input
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full">
              <div className="text-sm text-secondary-neutral-light-600">
                Email
              </div>
              <div className="mt-2 w-full">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                />
              </div>
              {email && email.length > 3 && !isValidEmail(email) && (
                <div className="flex flex-row items-start text-xs text-red-600 py-2">
                  <HintIcon className="w-8 h-8" />
                  <span>Please provide a valid email address!</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full">
              <div className="text-sm text-secondary-neutral-light-600">
                Message
              </div>
              <div className="mt-2 w-full">
                <textarea
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  placeholder="Enter your message"
                  className={`textarea textarea-lg w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        {successMessage && (
          <div className="flex flex-row items-start text-xs text-green-600 bg-green-50 py-2 px-2 rounded">
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex flex-row items-center text-xs text-red-600 bg-red-50 px-2 rounded">
            <HintIcon className="w-8 h-8 mr-1 pt-2" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </DialogWrapper>
  );
};

const ConfirmOrganizationCohortToken = () => {
  const router = useRouter();
  const { id } = router.query;
  const [token, setToken] = useState('');
  const [tokenErrorMsg, setTokenErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (token === '') {
      setTokenErrorMsg('Token is required');
      setTimeout(() => {
        setTokenErrorMsg('');
      }, 3000);
      return;
    }

    setLoading(true);

    try {
      await verifyCohortID(token);
      router.push({
        pathname: `/account/creation/organisation/verify/${id}/create-org/details`,
        query: { token, id },
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setTokenErrorMsg('Invalid token');
      setTimeout(() => {
        setTokenErrorMsg('');
      }, 3000);
    }
  };

  return (
    <AccountPageLayout
      childrenHeight={'lg:h-[500]'}
      childrenTop={'mt-8'}
      rightText={
        "What you've built here is so much better for air pollution monitoring than anything else on the market!"
      }
    >
      <ProgressComponent colorFirst />
      <div>
        <h2 className="text-3xl text-black-800 font-semibold">
          Please enter your organisation token
        </h2>
        <p className="text-base text-black-800 font-normal mt-3">
          The organisation token is provided by AirQo
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mt-8">
            <div className="w-full">
              <div className="text-sm text-secondary-neutral-light-600">
                Organization token
              </div>
              <div className="mt-2 w-full">
                <input
                  onChange={(e) => setToken(e.target.value)}
                  type="text"
                  placeholder="Enter your token"
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                />
                {tokenErrorMsg && (
                  <div className="flex flex-row items-start text-xs text-red-600 py-2">
                    <HintIcon className="w-8 h-8 mr-2" />
                    <span>{tokenErrorMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col-reverse md:flex-row items-center justify-start md:justify-between">
              <div className="w-full">
                <button
                  style={{ textTransform: 'none' }}
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full btn text-sm outline-none border-none rounded-[12px] bg-blue-900 text-white hover:bg-blue-950
                  "
                >
                  {loading && token !== '' && !tokenErrorMsg ? (
                    <Spinner data-testid="spinner" width={25} height={25} />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full flex justify-start">
            <div className="flex flex-col gap-3">
              <div className="text-sm text-blue-960 font-medium">
                Don't have a token?
              </div>
              <div className="text-sm text-blue-900">
                {' '}
                <button type="button" onClick={() => setModalOpen(true)}>
                  Contact admin
                </button>
              </div>
              <div className="text-sm text-blue-900">
                {' '}
                <Link href="/account/login">Proceed as an individual</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
      {modalOpen && (
        <ContactAdminModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </AccountPageLayout>
  );
};

export default ConfirmOrganizationCohortToken;
