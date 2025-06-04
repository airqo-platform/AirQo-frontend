'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountPageLayout from '@/components/Account/Layout';
import CustomToast from '@/components/Toast/CustomToast';
import InputField from '@/common/components/InputField';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import {
  createOrganisationRequestApi,
  getOrganisationSlugAvailabilityApi,
} from '@/core/apis/Account';
import logger from '@/lib/logger';

export default function OrgRequestAccessPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState(null);
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const slugCheckTimeoutRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    organizationType: '',
    useCase: '',
    additionalInfo: '',
    organizationSlug: '',
    branding_settings: {
      logo_url: '',
      primary_color: '',
      secondary_color: '',
    },
  });
  const [errors, setErrors] = useState({});

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

  const orgSlug = formData.organizationSlug;

  useEffect(() => {
    if (orgSlug && orgSlug.trim() !== '' && orgSlug.length >= 3) {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }

      setIsCheckingSlug(true);
      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlugAvailability(orgSlug);
      }, 500);
    } else {
      setSlugAvailability(null);
      setSlugSuggestions([]);
      setIsCheckingSlug(false);
    }

    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current);
      }
    };
  }, [orgSlug]);

  const checkSlugAvailability = async (slug) => {
    if (!slug) return;

    try {
      setIsCheckingSlug(true);
      const response = await getOrganisationSlugAvailabilityApi(slug ?? '');
      setSlugAvailability(response.available);
      setSlugSuggestions(response.alternativeSuggestions);
      return response.available;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error checking slug availability';
      CustomToast({
        message: errorMessage,
        type: 'error',
      });
      setSlugAvailability(null);
      setSlugSuggestions([]);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      organizationSlug: suggestion,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
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

    setFormData({
      ...formData,
      branding_settings: {
        ...formData.branding_settings,
        logo_url: '',
      },
    });
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

    if (!formData.country) {
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
    } else if (slugAvailability === false) {
      newErrors.organizationSlug =
        'This URL is already taken. Please choose another.';
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
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const uploadToCloudinary = async () => {
    if (!logoFile) return;
    const formData = new FormData();
    formData.append('file', logoFile);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append('folder', 'organization_profiles');
    setUploadingLogo(true);
    try {
      const responseData = await cloudinaryImageUpload(formData);
      return { secure_url: responseData.secure_url };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to upload image to Cloudinary';
      CustomToast({
        message: errorMessage,
        type: 'error',
      });
      logger.error('Uploading organization logo to cloudinary failed:', error);
      return { secure_url: '' };
    } finally {
      setUploadingLogo(false);
    }
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

    setIsSubmitting(true);

    try {
      let finalFormData = {
        organization_name: formData.organizationName,
        organization_slug: formData.organizationSlug,
        contact_email: formData.contactEmail,
        contact_name: formData.contactName,
        use_case: formData.useCase,
        organization_type: formData.organizationType,
        country: formData.country,
        branding_settings: {
          logo_url: formData.branding_settings.logo_url,
          primary_color: formData.branding_settings.primary_color,
          secondary_color: formData.branding_settings.secondary_color,
        },
      };

      if (logoFile) {
        try {
          const cloudinaryResponse = await uploadToCloudinary(logoFile);

          finalFormData = {
            ...finalFormData,
            branding_settings: {
              ...finalFormData.branding_settings,
              logo_url: cloudinaryResponse.secure_url,
            },
          };
        } catch (uploadError) {
          setErrors({
            logoFile: uploadError || 'Failed to upload logo. Please try again.',
          });
          setIsSubmitting(false);
          return;
        }
      }

      await createOrganisationRequestApi(finalFormData);

      router.replace('/user/creation/organisation/request-access/confirmation');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to send request submission failed. Please try again.';
      CustomToast({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!logoFile && formData.branding_settings.logo_url) {
      setLogoPreview(formData.branding_settings.logo_url);
    } else if (!formData.branding_settings.logo_url && !logoFile) {
      setLogoPreview('');
    }
  }, [formData.branding_settings.logo_url, logoFile]);

  return (
    <AccountPageLayout pageTitle={'Request Organization Access | AirQo'}>
      <div className="w-full">
        <button
          style={{ textTransform: 'none' }}
          type="button"
          className="btn text-sm outline-none border-gray-700 bg-white text-gray-700 hover:bg-gray-100 rounded-[12px] transition-colors mb-4"
          onClick={() => (currentStep === 1 ? router.back() : handlePrevStep())}
        >
          Back
        </button>
        {currentStep === 1 ? (
          <div>
            <h2 className="text-3xl text-black-700 font-medium">
              Request Organization Access
            </h2>
            <p className="text-xl text-black-700 font-normal mt-3">
              Join the AirQo platform for air quality monitoring and data
              access.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl text-black-700 font-medium">
              Organization Branding
            </h2>
            <p className="text-xl text-black-700 font-normal mt-3">
              Customize how your organization appears in the AirQo platform.
              These settings can be changed later.
            </p>
          </div>
        )}

        <div className="mt-6">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 ? (
              <>
                <div>
                  <InputField
                    label="Organization Name"
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                    error={errors.organizationName}
                  />
                </div>

                <div className="relative mb-4">
                  <label
                    htmlFor="organizationSlug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization URL
                    <span className="ml-1 text-blue-600 dark:text-blue-400">
                      *
                    </span>
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
                      className={`w-full px-4 py-2.5 rounded-r-xl border-gray-400 bg-transparent outline-none text-sm
            text-gray-700 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500
            disabled:text-gray-500 disabled:dark:text-gray-400
            disabled:cursor-not-allowed ${
              errors.organizationSlug
                ? 'border-red-500'
                : slugAvailability === true
                  ? 'border-green-500'
                  : 'border-gray-300'
            } focus-within:ring-2 focus-within:ring-offset-0 ${
              slugAvailability === true
                ? 'focus-within:ring-green-500'
                : 'focus-within:ring-blue-500'
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
                          ? 'text-green-600'
                          : slugAvailability === false
                            ? 'text-red-600'
                            : 'text-gray-500'
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
                          <span>{formData.organizationSlug} is available.</span>
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
                            {formData.organizationSlug} is already taken.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {slugSuggestions && slugSuggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        Try one of these instead:
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {slugSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.organizationSlug ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organizationSlug}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      This will be your unique URL in the AirQo platform. Use
                      only lowercase letters, numbers, and hyphens.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputField
                      label="Contact Name"
                      type="text"
                      id="contactName"
                      name="contactName"
                      placeholder="John Doe"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                      error={errors.contactName}
                    />
                  </div>

                  <div>
                    <InputField
                      label="Contact Email"
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      placeholder="johndoe@example.com"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                      error={errors.contactEmail}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputField
                      label="Contact Phone"
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      placeholder="+256123456789"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      required
                      error={errors.contactPhone}
                    />
                  </div>

                  <div>
                    <InputField
                      label="Country"
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      error={errors.country}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="organizationType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Type
                    <span className="text-blue-600 dark:text-blue-400 ml-1">
                      *
                    </span>
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border-gray-400 border text-sm ${errors.organizationType ? 'border-red-500' : 'border-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                  >
                    <option value="" disabled>
                      Select organization type
                    </option>
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

                <div className="my-4">
                  <label
                    htmlFor="useCase"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Describe how your organization plans to use AirQo platform
                    <span className="text-blue-600 dark:text-blue-400 ml-1">
                      *
                    </span>
                  </label>
                  <textarea
                    id="useCase"
                    name="useCase"
                    placeholder="We plan to ..."
                    value={formData.useCase}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm ${errors.useCase ? 'border-red-500' : 'border-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  ></textarea>
                  {errors.useCase && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.useCase}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  style={{ textTransform: 'none' }}
                  disabled={isSubmitting}
                  className={`w-full btn text-sm outline-none border-none rounded-[12px] bg-blue-600 text-white hover:bg-blue-700 transition-colors ${isSubmitting ? 'btn-disabled bg-white' : ''}`}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Logo
                  </label>

                  {/* File Upload Option */}
                  <div className="mb-4">
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center ${
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
                      <p className="mt-1 text-sm text-gray-600">
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
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove file
                        </button>
                      </div>
                    )}
                  </div>

                  {/* URL Option (as fallback) */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Or provide a direct URL to your logo:
                    </p>
                    <InputField
                      type="url"
                      id="logo_url"
                      name="branding_settings.logo_url"
                      placeholder="https://example.com/your-logo.png"
                      value={formData.branding_settings.logo_url}
                      onChange={handleInputChange}
                      disabled={!!logoFile}
                      error={errors['branding_settings.logo_url']}
                      description="Enter a direct URL to your organization's logo (PNG, JPG, or SVG format recommended)"
                    />
                  </div>

                  {/* Logo preview */}
                  {logoPreview && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Logo Preview:
                      </p>
                      <div className="h-24 flex items-center justify-center">
                        <img
                          src={logoPreview || '/placeholder.svg'}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                          onError={() => setLogoPreview('')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="primary_color"
                      className="block text-sm font-medium text-gray-700 mb-1"
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
                      <InputField
                        type="text"
                        aria-label="Primary color hex code"
                        name="branding_settings.primary_color"
                        value={formData.branding_settings.primary_color}
                        onChange={handleInputChange}
                        error={errors['branding_settings.primary_color']}
                        description="Your main brand color (e.g., #004080 for dark blue)"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="secondary_color"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Secondary Brand Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        id="secondary_color"
                        name="branding_settings.secondary_color"
                        value={formData.branding_settings.secondary_color}
                        onChange={handleInputChange}
                        className="h-10 w-10 border-0 p-0 rounded-md cursor-pointer"
                      />
                      <InputField
                        type="text"
                        aria-label="Secondary color hex code"
                        name="branding_settings.secondary_color"
                        value={formData.branding_settings.secondary_color}
                        onChange={handleInputChange}
                        error={errors['branding_settings.secondary_color']}
                        description="Your accent color (e.g., #FFFFFF for white)"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">
                    Brand Preview
                  </h3>
                  <div
                    className="flex items-center p-3 rounded-md"
                    style={{
                      backgroundColor: formData.branding_settings.primary_color,
                    }}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview || '/placeholder.svg'}
                        alt="Organization logo"
                        className="h-8 mr-3 bg-white p-1 rounded"
                      />
                    ) : (
                      <div
                        className="h-8 w-8 mr-3 bg-white rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          color: formData.branding_settings.primary_color,
                        }}
                      >
                        {formData.organizationName
                          ? formData.organizationName.charAt(0).toUpperCase()
                          : 'O'}
                      </div>
                    )}
                    <span
                      className="font-medium text-sm"
                      style={{
                        color: formData.branding_settings.secondary_color,
                      }}
                    >
                      {formData.organizationName || 'Your Organization'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This is how your organization will appear in the AirQo
                    platform
                  </p>
                </div>

                <div className="flex justify-between mt-8">
                  {currentStep === 2 && (
                    <button
                      type="button"
                      style={{ textTransform: 'none' }}
                      onClick={handlePrevStep}
                      className="btn text-sm outline-none border-gray-700 bg-white text-gray-700 hover:bg-gray-100 rounded-[12px] transition-colors"
                    >
                      Back
                    </button>
                  )}

                  <button
                    type="submit"
                    style={{ textTransform: 'none' }}
                    disabled={isSubmitting || uploadingLogo}
                    className="w-[50%] btn border-none bg-blue-600 dark:bg-blue-700 rounded-lg text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-500">
            By submitting this form, you agree to our{' '}
            <a
              href="https://airqo.net/legal/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://airqo.net/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </AccountPageLayout>
  );
}
