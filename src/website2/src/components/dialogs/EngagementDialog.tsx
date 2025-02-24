'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import mainConfig from '@/configs/mainConfigs';
import { useDispatch, useSelector } from '@/hooks';
import { postContactUs } from '@/services/externalService';
import { closeModal } from '@/store/slices/modalSlice';

import { CustomButton } from '../ui';

interface EngagementOption {
  title: string;
  description: string;
  icon: string;
  category: string;
}

const options: EngagementOption[] = [
  {
    title: "I'm a Partner.",
    description: "Interested in supporting AirQo's vision",
    icon: '🔗',
    category: 'partners',
  },
  {
    title: "I'm a Policymaker.",
    description: 'Interested in air quality information',
    icon: '📜',
    category: 'policy',
  },
  {
    title: "I'm a Community Champion.",
    description: 'Interested in raising awareness about air pollution.',
    icon: '🌍',
    category: 'champions',
  },
  {
    title: "I'm a Researcher.",
    description: 'Interested in Air Quality data and analytics',
    icon: '📊',
    category: 'researchers',
  },
  {
    title: "I'm a Developer.",
    description:
      'Interested in establishing an Air Quality Network, utilizing the AirQo API, or both.',
    icon: '💻',
    category: 'developers',
  },
];

// Define motion variants for reusable animations
const containerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

const textVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const optionVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.05,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const errorVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const EngagementDialog = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: any) => state.modal.isOpen);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    termsAccepted: false,
  });

  const handleClose = () => {
    dispatch(closeModal());
    setActiveSection(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      termsAccepted: false,
    });
    setSubmissionSuccess(false); // Reset success message
    setSubmissionError(null); // Reset error message
  };

  const handleItemClick = (title: string, category: string) => {
    setActiveSection(title);
    setSelectedCategory(category);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmissionError(null);

    if (formData.termsAccepted && selectedCategory) {
      // Create the request body
      const requestBody = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: 'Get involved - Request from the website',
        category: selectedCategory,
      };

      try {
        const res = await postContactUs(requestBody);
        if (res.success) {
          setSubmissionSuccess(true);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            termsAccepted: false,
          });
        } else {
          throw new Error('Failed to submit');
        }
      } catch (error) {
        setSubmissionError('Oops! Something went wrong. Please try again.');
        console.error('Error submitting form:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      alert('You must accept the terms and conditions and select a category.');
    }
  };

  const renderForm = () => (
    <AnimatePresence>
      <motion.div
        key="form"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full flex flex-col justify-center gap-6 h-full p-6"
      >
        <button
          onClick={() => {
            setActiveSection(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              termsAccepted: false,
            });
            setSubmissionError(null);
          }}
          className="mb-4 text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center w-full gap-6"
        >
          {/* First Name */}
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="mb-2 text-gray-600">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="p-2 border-b border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#F9FAFB]"
              required
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col w-full">
            <label htmlFor="lastName" className="mb-2 text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="p-2 border-b border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#F9FAFB]"
              required
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="mb-2 text-gray-600">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="p-2 border-b border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-[#F9FAFB]"
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start text-sm">
            <input
              type="checkbox"
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className="mr-2 relative top-[5px]"
              required
            />
            <label htmlFor="terms" className="text-gray-600">
              I agree to the{' '}
              <a
                href="/terms"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {submissionError && (
            <motion.div
              key="error"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              className="text-red-600 text-sm"
            >
              {submissionError}
            </motion.div>
          )}

          <CustomButton
            type="submit"
            className="bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </CustomButton>
        </form>
      </motion.div>
    </AnimatePresence>
  );

  const renderSuccessMessage = () => (
    <AnimatePresence>
      <motion.div
        key="success"
        variants={successVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full flex flex-col items-center justify-center gap-6 h-full p-6"
      >
        <h2 className="text-3xl font-bold text-green-600">Success!</h2>
        <p className="text-gray-600 text-lg">
          Thank you for your submission. We will get in touch with you soon!
        </p>
        <CustomButton
          onClick={handleClose}
          className="bg-blue-600 text-white px-6 py-4 hover:bg-blue-700 transition-colors"
        >
          Close
        </CustomButton>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`${mainConfig.containerClass} max-h-[90vh] p-0 overflow-x-hidden overflow-y-auto md:overflow-hidden`}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Breadcrumb and Text with Animation */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-6 h-full bg-gray-100 p-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <a href="#" className="text-gray-500">
                    Home
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">{'>'}</span>
                </li>
                <li>
                  <a href="#" className="text-gray-900 font-medium">
                    Get Involved
                  </a>
                </li>
              </ol>
            </nav>
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="space-y-2 lg:w-[65%]"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                How would you like to engage with us?
              </h2>
              <p className="text-gray-500">
                Access real-time and historic air quality information across
                Africa through our easy-to-use air quality analytics dashboard.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col justify-center gap-6 h-full p-2 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            {submissionSuccess
              ? renderSuccessMessage()
              : !activeSection
                ? options.map((item, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => handleItemClick(item.title, item.category)}
                      className="flex items-center p-4 bg-white border rounded-md shadow-sm hover:bg-blue-50 cursor-pointer transition-all"
                      variants={optionVariants}
                      initial="hidden"
                      animate="visible"
                      custom={idx}
                    >
                      <div className="flex-shrink-0 p-2 bg-blue-50 rounded-full text-blue-600 text-2xl">
                        {item.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))
                : renderForm()}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EngagementDialog;
