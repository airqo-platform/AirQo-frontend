import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import PropTypes from 'prop-types';
import Button from '@/common/components/Button';
import InputField from '@/common/components/InputField';
import TextInputField from '@/common/components/TextInputField';
import SelectField from '@/common/components/SelectField';
import CustomToast from '@/common/components/Toast/CustomToast';
import {
  validateStep1,
  validateStep2,
  validateFile,
} from '../utils/validation';
import {
  generateSlugFromName,
  handleInputChange as utilHandleInputChange,
  getInitialFormData,
  transformFormDataForAPI,
} from '../utils/formUtils';
import { useCreateOrganization } from '../hooks/useCreateOrganization';

/**
 * CreateOrganizationDialog Component
 *
 * A responsive two-step dialog for requesting organization access.
 * Includes all fields from the reference page with proper validation.
 */
const CreateOrganizationDialog = ({ isOpen, onClose, onSubmit }) => {
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  const {
    isSubmitting,
    slugAvailability,
    slugSuggestions,
    isCheckingSlug,
    checkSlugAvailability,
    submitOrganizationRequest,
  } = useCreateOrganization();

  // Auto-generate slug from organization name
  useEffect(() => {
    if (
      formData.organizationName &&
      currentStep === 1 &&
      !formData.organizationSlug
    ) {
      const generatedSlug = generateSlugFromName(formData.organizationName);
      setFormData((prev) => ({
        ...prev,
        organizationSlug: generatedSlug,
      }));
    }
  }, [formData.organizationName, currentStep]);
  // Check slug availability with debouncing
  useEffect(() => {
    if (
      formData.organizationSlug &&
      formData.organizationSlug.trim() !== '' &&
      formData.organizationSlug.length >= 3
    ) {
      const timeoutId = setTimeout(() => {
        checkSlugAvailability(formData.organizationSlug);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.organizationSlug]); // Removed checkSlugAvailability from dependencies

  const handleInputChange = (e) => {
    utilHandleInputChange(e, setFormData, setErrors, errors);
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      organizationSlug: suggestion,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      setErrors((prev) => ({
        ...prev,
        logoFile: fileValidation.error,
      }));
      return;
    }

    // Clear file errors
    if (errors.logoFile) {
      const newErrors = { ...errors };
      delete newErrors.logoFile;
      setErrors(newErrors);
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({
      ...prev,
      branding_settings: {
        ...prev.branding_settings,
        logo_url: '',
      },
    }));
  };

  const handleRemoveFile = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Logo preview effect
  useEffect(() => {
    if (!logoFile && formData.branding_settings.logo_url) {
      setLogoPreview(formData.branding_settings.logo_url);
    } else if (!formData.branding_settings.logo_url && !logoFile) {
      setLogoPreview('');
    }
  }, [formData.branding_settings.logo_url, logoFile]);

  const handleNextStep = () => {
    const validation = validateStep1(formData, slugAvailability);

    if (validation.isValid) {
      setCurrentStep(2);
      setErrors({});
    } else {
      setErrors(validation.errors);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    // Validate step 2
    const validation = validateStep2(formData, logoFile);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const apiData = transformFormDataForAPI(formData);
      const result = await submitOrganizationRequest(apiData, logoFile);

      if (result.success) {
        // Reset form
        setFormData(getInitialFormData());
        setCurrentStep(1);
        setLogoFile(null);
        setLogoPreview('');
        setErrors({});

        if (onSubmit) {
          onSubmit();
        }
        onClose();
      }
    } catch (error) {
      CustomToast({
        message:
          error.message ||
          'Failed to submit organization request. Please try again.',
        type: 'error',
      });
    }
  };

  const handleClose = () => {
    setFormData(getInitialFormData());
    setErrors({});
    setCurrentStep(1);
    setLogoFile(null);
    setLogoPreview('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-[90vw] max-w-[800px] min-w-[320px] max-h-[95vh] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all flex flex-col mx-2 sm:mx-4">
                {/* Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="text-xl sm:text-2xl font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {currentStep === 1
                      ? 'Request Organization Access'
                      : 'Organization Branding'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Scrollable form container */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 mt-4">
                    {currentStep === 1
                      ? 'Join the AirQo platform for air quality monitoring and data access.'
                      : 'Customize how your organization appears in the AirQo platform. These settings can be changed later.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {currentStep === 1 ? (
                      // Step 1: Organization Details
                      <div className="space-y-6">
                        {/* Organization Name */}
                        <InputField
                          label="Organization Name"
                          id="organizationName"
                          name="organizationName"
                          type="text"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          placeholder="Enter your organization name"
                          required
                          error={errors.organizationName}
                        />

                        {/* Organization URL */}
                        <div>
                          {' '}
                          <label
                            htmlFor="organizationSlug"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                          >
                            Organization URL{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                              *
                            </span>
                          </label>
                          <div className="flex items-center">
                            <span className="bg-gray-100 dark:bg-gray-600 px-4 py-2.5 rounded-l-xl text-gray-500 dark:text-gray-300 border border-r-0 border-gray-400 dark:border-gray-500 text-sm">
                              analytics.airqo.net/
                            </span>
                            <input
                              type="text"
                              id="organizationSlug"
                              name="organizationSlug"
                              placeholder="nairobi-air-lab"
                              value={formData.organizationSlug}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 rounded-r-xl border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 ${
                                errors.organizationSlug
                                  ? 'border-red-500 dark:border-red-400'
                                  : slugAvailability === true
                                    ? 'border-green-500 dark:border-green-400'
                                    : 'border-gray-300 dark:border-gray-500'
                              } focus-within:ring-2 focus-within:ring-offset-0 ${
                                slugAvailability === true
                                  ? 'focus-within:ring-green-500 dark:focus-within:ring-green-400'
                                  : 'focus-within:ring-blue-500 dark:focus-within:ring-blue-400'
                              }`}
                            />
                            {isCheckingSlug && (
                              <div className="absolute right-3 top-9">
                                <svg
                                  className="animate-spin h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          {formData.organizationSlug && !isCheckingSlug && (
                            <div
                              className={`mt-1 text-sm ${
                                slugAvailability === true
                                  ? 'text-green-600 dark:text-green-400'
                                  : slugAvailability === false
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {slugAvailability === true && (
                                <div className="flex items-center">
                                  <span className="inline-block w-4 h-4 mr-1 rounded-full bg-green-100 border border-green-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 text-green-500 mx-auto"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                  <span>
                                    {formData.organizationSlug} is available.
                                  </span>
                                </div>
                              )}
                              {slugAvailability === false && (
                                <div className="flex items-center">
                                  <span className="inline-block w-4 h-4 mr-1 rounded-full bg-red-100 border border-red-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 text-red-500 mx-auto"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                  <span>
                                    {formData.organizationSlug} is already
                                    taken.
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {slugSuggestions && slugSuggestions.length > 0 && (
                            <div className="mt-2">
                              {' '}
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Try one of these instead:
                              </p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {slugSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() =>
                                      handleSuggestionClick(suggestion)
                                    }
                                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}{' '}
                          {errors.organizationSlug ? (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.organizationSlug}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              This will be your unique URL in the AirQo
                              platform. Use only lowercase letters, numbers, and
                              hyphens.
                            </p>
                          )}
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Contact Name"
                            id="contactName"
                            name="contactName"
                            type="text"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                            error={errors.contactName}
                          />

                          <InputField
                            label="Contact Email"
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            placeholder="johndoe@example.com"
                            required
                            error={errors.contactEmail}
                          />
                        </div>

                        {/* Phone and Country */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Contact Phone"
                            id="contactPhone"
                            name="contactPhone"
                            type="tel"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            placeholder="+256123456789"
                            required
                            error={errors.contactPhone}
                          />

                          <InputField
                            label="Country"
                            id="country"
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Enter your country"
                            required
                            error={errors.country}
                          />
                        </div>

                        {/* Organization Type */}
                        <SelectField
                          label="Organization Type"
                          id="organizationType"
                          name="organizationType"
                          value={formData.organizationType}
                          onChange={handleInputChange}
                          required
                          error={errors.organizationType}
                        >
                          <option value="" disabled>
                            Select organization type
                          </option>
                          <option value="government">Government</option>
                          <option value="academic">Academic/Research</option>
                          <option value="ngo">NGO/Non-profit</option>
                          <option value="private">Private Sector</option>
                          <option value="other">Other</option>
                        </SelectField>

                        {/* Use Case */}
                        <TextInputField
                          label="Describe how your organization plans to use AirQo platform"
                          id="useCase"
                          name="useCase"
                          value={formData.useCase}
                          onChange={handleInputChange}
                          placeholder="We plan to ..."
                          required
                          error={errors.useCase}
                          rows={4}
                        />
                      </div>
                    ) : (
                      // Step 2: Branding
                      <div className="space-y-6">
                        {/* Logo Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Organization Logo
                          </label>

                          {/* File Upload Option */}
                          <div className="mb-4">
                            <div
                              className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                                errors.logoFile
                                  ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/svg+xml,image/gif"
                                className="hidden"
                              />
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {logoFile
                                  ? logoFile.name
                                  : 'Click to upload your organization logo'}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, SVG, or GIF (max. 2MB)
                              </p>
                            </div>
                            {errors.logoFile && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.logoFile}
                              </p>
                            )}

                            {logoFile && (
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
                                  Remove file
                                </button>
                              </div>
                            )}
                          </div>

                          {/* URL Option (as fallback) */}
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Or provide a direct URL to your logo:
                            </p>
                            <InputField
                              id="logo_url"
                              name="branding_settings.logo_url"
                              type="url"
                              value={formData.branding_settings.logo_url}
                              onChange={handleInputChange}
                              placeholder="https://example.com/your-logo.png"
                              disabled={!!logoFile}
                              error={errors['branding_settings.logo_url']}
                              description="Enter a direct URL to your organization's logo (PNG, JPG, or SVG format recommended)"
                            />
                          </div>

                          {/* Logo preview */}
                          {logoPreview && (
                            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Logo Preview:
                              </p>
                              <div className="h-24 flex items-center justify-center">
                                <img
                                  src={logoPreview}
                                  alt="Logo preview"
                                  className="max-h-full max-w-full object-contain"
                                  onError={() => setLogoPreview('')}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Brand Colors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="primary_color"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                              Primary Brand Color
                            </label>
                            <div className="flex">
                              <input
                                type="color"
                                id="primary_color"
                                name="branding_settings.primary_color"
                                value={formData.branding_settings.primary_color}
                                onChange={handleInputChange}
                                className="h-10 w-10 border-0 p-0 rounded-md cursor-pointer"
                              />
                              <input
                                type="text"
                                aria-label="Primary color hex code"
                                name="branding_settings.primary_color"
                                value={formData.branding_settings.primary_color}
                                onChange={handleInputChange}
                                className={`ml-2 flex-1 px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                                  errors['branding_settings.primary_color']
                                    ? 'border-red-500 dark:border-red-400'
                                    : 'border-gray-400 dark:border-gray-600'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                              />
                            </div>
                            {errors['branding_settings.primary_color'] && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors['branding_settings.primary_color']}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Your main brand color (e.g., #004080 for dark
                              blue)
                            </p>
                          </div>

                          <div>
                            <label
                              htmlFor="secondary_color"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                              Secondary Brand Color
                            </label>
                            <div className="flex">
                              <input
                                type="color"
                                id="secondary_color"
                                name="branding_settings.secondary_color"
                                value={
                                  formData.branding_settings.secondary_color
                                }
                                onChange={handleInputChange}
                                className="h-10 w-10 border-0 p-0 rounded-md cursor-pointer"
                              />
                              <input
                                type="text"
                                aria-label="Secondary color hex code"
                                name="branding_settings.secondary_color"
                                value={
                                  formData.branding_settings.secondary_color
                                }
                                onChange={handleInputChange}
                                className={`ml-2 flex-1 px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                                  errors['branding_settings.secondary_color']
                                    ? 'border-red-500 dark:border-red-400'
                                    : 'border-gray-400 dark:border-gray-600'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                              />
                            </div>
                            {errors['branding_settings.secondary_color'] && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors['branding_settings.secondary_color']}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Your accent color (e.g., #FFFFFF for white)
                            </p>
                          </div>
                        </div>

                        {/* Brand Preview */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200 mb-2">
                            Brand Preview
                          </h3>
                          <div
                            className="flex items-center p-3 rounded-md"
                            style={{
                              backgroundColor:
                                formData.branding_settings.primary_color,
                            }}
                          >
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Organization logo"
                                className="h-8 mr-3 bg-white p-1 rounded"
                              />
                            ) : (
                              <div
                                className="h-8 w-8 mr-3 bg-white rounded flex items-center justify-center text-xs font-bold"
                                style={{
                                  color:
                                    formData.branding_settings.primary_color,
                                }}
                              >
                                {formData.organizationName
                                  ? formData.organizationName
                                      .charAt(0)
                                      .toUpperCase()
                                  : 'O'}
                              </div>
                            )}
                            <span
                              className="font-medium text-sm"
                              style={{
                                color:
                                  formData.branding_settings.secondary_color,
                              }}
                            >
                              {formData.organizationName || 'Your Organization'}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            This is how your organization will appear in the
                            AirQo platform
                          </p>
                        </div>
                      </div>
                    )}{' '}
                    {/* Dialog Actions */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {currentStep === 2 && (
                        <Button
                          type="button"
                          onClick={handlePrevStep}
                          variant="outlined"
                          className="text-sm"
                        >
                          Back
                        </Button>
                      )}

                      <div className="flex gap-3 ml-auto">
                        <Button
                          type="button"
                          onClick={handleClose}
                          variant="outlined"
                          className="text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="text-sm min-w-[120px]"
                        >
                          {isSubmitting
                            ? 'Submitting...'
                            : currentStep === 1
                              ? 'Continue'
                              : 'Submit Request'}
                        </Button>
                      </div>
                    </div>
                    {/* Terms and Privacy */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By submitting this form, you agree to our{' '}
                        <a
                          href="https://airqo.net/legal/terms-of-service"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                          href="https://airqo.net/legal/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Privacy Policy
                        </a>
                        .{' '}
                      </p>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

CreateOrganizationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

export default CreateOrganizationDialog;
