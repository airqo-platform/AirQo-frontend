import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import PropTypes from 'prop-types';
import Button from '@/common/components/Button';

/**
 * CreateOrganizationDialog Component
 *
 * A responsive two-step dialog for requesting organization access.
 * Includes all fields from the reference page with proper validation.
 */
const CreateOrganizationDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    organizationType: '',
    useCase: '',
    organizationSlug: '',
    branding_settings: {
      logo_url: '',
      primary_color: '#004080',
      secondary_color: '#FFFFFF',
    },
  });
  const [errors, setErrors] = useState({});
  // Auto-generate slug from organization name
  useEffect(() => {
    if (
      formData.organizationName &&
      currentStep === 1 &&
      !formData.organizationSlug
    ) {
      const generatedSlug = formData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      setFormData((prev) => ({
        ...prev,
        organizationSlug: generatedSlug,
      }));
    }
  }, [formData.organizationName, currentStep]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/gif',
    ];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        logoFile: 'Please select a valid image file (JPEG, PNG, SVG, or GIF)',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        logoFile: 'Image file size must be less than 2MB',
      });
      return;
    }

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

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (formData.contactPhone.length < 10) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.organizationType) {
      newErrors.organizationType = 'Organization type is required';
    }

    if (!formData.useCase.trim()) {
      newErrors.useCase = 'Use case is required';
    } else if (formData.useCase.length < 10) {
      newErrors.useCase = 'Use case must be at least 10 characters';
    }

    if (!formData.organizationSlug.trim()) {
      newErrors.organizationSlug = 'Organization URL is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.organizationSlug)) {
      newErrors.organizationSlug =
        'URL can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (
      !logoFile &&
      formData.branding_settings.logo_url &&
      !formData.branding_settings.logo_url.match(
        /^(https?:\/\/)?([\w-])+\.{1}([a-zA-Z]{2,63})([/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)$/,
      )
    ) {
      newErrors['branding_settings.logo_url'] =
        'Please enter a valid URL or upload an image file';
    }

    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (
      formData.branding_settings.primary_color &&
      !colorRegex.test(formData.branding_settings.primary_color)
    ) {
      newErrors['branding_settings.primary_color'] =
        'Please enter a valid hex color code';
    }

    if (
      formData.branding_settings.secondary_color &&
      !colorRegex.test(formData.branding_settings.secondary_color)
    ) {
      newErrors['branding_settings.secondary_color'] =
        'Please enter a valid hex color code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    try {
      const finalFormData = {
        organization_name: formData.organizationName,
        organization_slug: formData.organizationSlug,
        contact_email: formData.contactEmail,
        contact_name: formData.contactName,
        use_case: formData.useCase,
        organization_type: formData.organizationType,
        country: formData.country,
        branding_settings: {
          logo_url: logoFile
            ? 'LOGO_FILE_UPLOADED'
            : formData.branding_settings.logo_url,
          primary_color: formData.branding_settings.primary_color,
          secondary_color: formData.branding_settings.secondary_color,
        },
        logoFile: logoFile,
      };

      await onSubmit(finalFormData);
      handleClose();
    } catch {
      // Error handling will be implemented when API is added
    }
  };
  const handleClose = () => {
    setFormData({
      organizationName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      country: '',
      organizationType: '',
      useCase: '',
      organizationSlug: '',
      branding_settings: {
        logo_url: '',
        primary_color: '#004080',
        secondary_color: '#FFFFFF',
      },
    });
    setErrors({});
    setCurrentStep(1);
    setLogoFile(null);
    setLogoPreview('');
    onClose();
  };

  // Update logo preview when URL changes
  useEffect(() => {
    if (!logoFile && formData.branding_settings.logo_url) {
      setLogoPreview(formData.branding_settings.logo_url);
    } else if (!formData.branding_settings.logo_url && !logoFile) {
      setLogoPreview('');
    }
  }, [formData.branding_settings.logo_url, logoFile]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl h-[90vh] transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all dark:bg-gray-800 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {currentStep === 1
                      ? 'Request Organization Access'
                      : 'Organization Branding'}
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {currentStep === 1
                      ? 'Join the AirQo platform for air quality monitoring and data access.'
                      : 'Customize how your organization appears in the AirQo platform. These settings can be changed later.'}
                  </p>

                  {/* Step indicator */}
                  <div className="mt-4 flex items-center space-x-4">
                    <div
                      className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        1
                      </div>
                      <span className="text-sm font-medium">
                        Organization Details
                      </span>
                    </div>
                    <div
                      className={`h-px flex-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
                    ></div>
                    <div
                      className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        2
                      </div>
                      <span className="text-sm font-medium">Branding</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {currentStep === 1 ? (
                      // Step 1: Organization Details
                      <>
                        {/* Organization Name */}
                        <div>
                          <label
                            htmlFor="organizationName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Organization Name{' '}
                            <span className="text-blue-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="organizationName"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                              errors.organizationName
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            placeholder="Enter organization name"
                          />
                          {errors.organizationName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.organizationName}
                            </p>
                          )}
                        </div>

                        {/* Organization URL */}
                        <div>
                          <label
                            htmlFor="organizationSlug"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Organization URL{' '}
                            <span className="text-blue-600">*</span>
                          </label>
                          <div className="flex items-center">
                            <span className="bg-gray-100 px-4 py-2.5 rounded-l-xl text-gray-500 border border-r-0 border-gray-400 text-sm">
                              analytics.airqo.net/
                            </span>
                            <input
                              type="text"
                              id="organizationSlug"
                              name="organizationSlug"
                              placeholder="nairobi-air-lab"
                              value={formData.organizationSlug}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 rounded-r-xl border-gray-400 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                                errors.organizationSlug
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                          {errors.organizationSlug ? (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.organizationSlug}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-500">
                              This will be your unique URL in the AirQo
                              platform. Use only lowercase letters, numbers, and
                              hyphens.
                            </p>
                          )}
                        </div>

                        {/* Contact Information - Two Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="contactName"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                              Contact Name{' '}
                              <span className="text-blue-600">*</span>
                            </label>
                            <input
                              type="text"
                              id="contactName"
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                errors.contactName
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              }`}
                              placeholder="John Doe"
                            />
                            {errors.contactName && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.contactName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="contactEmail"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                              Contact Email{' '}
                              <span className="text-blue-600">*</span>
                            </label>
                            <input
                              type="email"
                              id="contactEmail"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                errors.contactEmail
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              }`}
                              placeholder="johndoe@example.com"
                            />
                            {errors.contactEmail && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.contactEmail}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Phone and Country - Two Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="contactPhone"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                              Contact Phone{' '}
                              <span className="text-blue-600">*</span>
                            </label>
                            <input
                              type="tel"
                              id="contactPhone"
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                errors.contactPhone
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              }`}
                              placeholder="+256123456789"
                            />
                            {errors.contactPhone && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.contactPhone}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="country"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                              Country <span className="text-blue-600">*</span>
                            </label>
                            <input
                              type="text"
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                errors.country
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              }`}
                              placeholder="Uganda"
                            />
                            {errors.country && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.country}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Organization Type */}
                        <div>
                          <label
                            htmlFor="organizationType"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Organization Type{' '}
                            <span className="text-blue-600">*</span>
                          </label>
                          <select
                            id="organizationType"
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                              errors.organizationType
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select organization type</option>
                            <option value="government">Government</option>
                            <option value="academic">Academic/Research</option>
                            <option value="ngo">NGO/Non-profit</option>
                            <option value="private">Private Sector</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.organizationType && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.organizationType}
                            </p>
                          )}
                        </div>

                        {/* Use Case */}
                        <div>
                          <label
                            htmlFor="useCase"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Describe how your organization plans to use AirQo
                            platform <span className="text-blue-600">*</span>
                          </label>
                          <textarea
                            id="useCase"
                            name="useCase"
                            value={formData.useCase}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                              errors.useCase
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            placeholder="We plan to use AirQo platform for..."
                          />
                          {errors.useCase && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.useCase}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      // Step 2: Branding
                      <>
                        {/* Organization Logo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Organization Logo
                          </label>

                          {/* File Upload Option */}
                          <div className="mb-4">
                            <div
                              className={`border-2 border-dashed rounded-xl p-6 text-center ${
                                errors.logoFile
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-300 bg-gray-50'
                              } hover:bg-gray-100 transition-colors cursor-pointer`}
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
                                className="mx-auto h-12 w-12 text-gray-400"
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
                              <p className="mt-2 text-sm text-gray-600">
                                {logoFile
                                  ? logoFile.name
                                  : 'Click to upload your organization logo'}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                PNG, JPG, SVG, or GIF (max. 2MB)
                              </p>
                            </div>
                            {errors.logoFile && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.logoFile}
                              </p>
                            )}

                            {logoFile && (
                              <div className="mt-2 flex justify-end">
                                <Button
                                  variant="text"
                                  onClick={handleRemoveFile}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove file
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* URL Option */}
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Or provide a direct URL to your logo:
                            </p>
                            <input
                              type="url"
                              name="branding_settings.logo_url"
                              placeholder="https://example.com/your-logo.png"
                              value={formData.branding_settings.logo_url}
                              onChange={handleInputChange}
                              disabled={!!logoFile}
                              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                errors['branding_settings.logo_url']
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } ${logoFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            {errors['branding_settings.logo_url'] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors['branding_settings.logo_url']}
                              </p>
                            )}
                          </div>

                          {/* Logo preview */}
                          {logoPreview && (
                            <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                        {/* Brand Colors - Two Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="primary_color"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                              Primary Brand Color
                            </label>
                            <div className="flex space-x-2">
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
                                name="branding_settings.primary_color"
                                value={formData.branding_settings.primary_color}
                                onChange={handleInputChange}
                                className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                  errors['branding_settings.primary_color']
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }`}
                                placeholder="#004080"
                              />
                            </div>
                            {errors['branding_settings.primary_color'] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors['branding_settings.primary_color']}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="secondary_color"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                              Secondary Brand Color
                            </label>
                            <div className="flex space-x-2">
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
                                name="branding_settings.secondary_color"
                                value={
                                  formData.branding_settings.secondary_color
                                }
                                onChange={handleInputChange}
                                className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm ${
                                  errors['branding_settings.secondary_color']
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }`}
                                placeholder="#FFFFFF"
                              />
                            </div>
                            {errors['branding_settings.secondary_color'] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors['branding_settings.secondary_color']}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Brand Preview */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
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
                      </>
                    )}
                  </form>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
                  <div className="flex justify-end items-center gap-3">
                    <Button
                      variant="outlined"
                      onClick={currentStep === 1 ? handleClose : handlePrevStep}
                    >
                      {currentStep === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? 'Submitting...'
                        : currentStep === 1
                          ? 'Continue'
                          : 'Submit Request'}
                    </Button>
                  </div>
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
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default CreateOrganizationDialog;
