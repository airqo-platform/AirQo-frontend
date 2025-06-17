import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
 * CreateOrganizationForm Component
 *
 * A reusable form component for creating organizations.
 * Can be used in modals, pages, or any other container.
 */
const CreateOrganizationForm = ({
  onSuccess,
  onCancel,
  showCancelButton = true,
  className = '',
}) => {
  const router = useRouter();
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
  }, [formData.organizationSlug]);

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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
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

        if (onSuccess) {
          onSuccess();
        } else {
          // Default behavior: navigate to user home
          router.push('/user/Home');
        }
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

  const handleCancel = () => {
    // Reset form
    setFormData(getInitialFormData());
    setCurrentStep(1);
    setLogoFile(null);
    setLogoPreview('');
    setErrors({});

    if (onCancel) {
      onCancel();
    } else {
      // Default behavior: navigate back
      router.back();
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 mx-2 ${
                currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              2
            </div>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary dark:text-primary-light">
            {currentStep === 1 ? 'Organization Details' : 'Branding & Preview'}
          </h2>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark">
            {currentStep === 1
              ? 'Tell us about your organization to join the AirQo platform.'
              : 'Customize how your organization appears in the platform.'}
          </p>
        </div>
      </div>

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
              <label
                htmlFor="organizationSlug"
                className="block text-sm font-medium text-text dark:text-text-dark mb-1"
              >
                Organization URL{' '}
                <span className="text-primary dark:text-primary/40">*</span>
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
                  className="w-full px-4 py-2.5 rounded-r-xl border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                />
                {isCheckingSlug && (
                  <div className="ml-2 flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-600"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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
                      <span>{formData.organizationSlug} is already taken.</span>
                    </div>
                  )}
                </div>
              )}
              {slugSuggestions && slugSuggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Try one of these instead:
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {slugSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-sm rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.organizationSlug ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.organizationSlug}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This will be your unique URL in the AirQo platform
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Contact Name"
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="Enter contact person's name"
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
                placeholder="contact@organization.com"
                required
                error={errors.contactEmail}
              />

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
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                Organization Logo
              </label>

              {/* File Upload Option */}
              <div className="mb-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                    errors.logoFile
                      ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-destructive hover:text-destructive/80 text-sm"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>

              {/* Logo Preview */}
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
                    className="w-12 h-10 rounded-l-xl border border-gray-400 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#135DFF"
                    value={formData.branding_settings.primary_color}
                    onChange={handleInputChange}
                    name="branding_settings.primary_color"
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
                  Your main brand color (e.g., #135DFF for blue)
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
                    value={formData.branding_settings.secondary_color}
                    onChange={handleInputChange}
                    className="w-12 h-10 rounded-l-xl border border-gray-400 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#1B2559"
                    value={formData.branding_settings.secondary_color}
                    onChange={handleInputChange}
                    name="branding_settings.secondary_color"
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
                  backgroundColor: formData.branding_settings.primary_color,
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
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This is how your organization will appear in the AirQo platform
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
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
            {showCancelButton && (
              <Button
                type="button"
                onClick={handleCancel}
                variant="outlined"
                className="text-sm"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (currentStep === 1 && slugAvailability === false)
              }
              className="text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {currentStep === 1 ? 'Checking...' : 'Submitting...'}
                </div>
              ) : currentStep === 1 ? (
                'Continue'
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganizationForm;
