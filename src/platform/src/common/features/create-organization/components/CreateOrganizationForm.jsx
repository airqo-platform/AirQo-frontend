import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  getInitialFormData,
  handleInputChange as utilsHandleInputChange,
} from '../utils/formUtils';
import {
  AqLoading01,
  AqCheck,
  AqXClose,
  AqImagePlus,
} from '@airqo/icons-react';
import { useCreateOrganization } from '../hooks/useCreateOrganization';

const CreateOrganizationForm = ({
  onSuccess,
  onCancel,
  showCancelButton = true,
  className = '',
}) => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const {
    isSubmitting,
    slugAvailability,
    slugSuggestions,
    isCheckingSlug,
    checkSlugAvailability,
    submitOrganizationRequest,
    resetSlugCheck, // Import the new reset function
  } = useCreateOrganization();

  const initialFormData = useMemo(getInitialFormData, []);

  // Auto-generate slug from org name
  useEffect(() => {
    if (
      currentStep === 1 &&
      formData.organizationName &&
      !formData.organizationSlug
    ) {
      const newSlug = generateSlugFromName(formData.organizationName);
      setFormData((prev) => ({
        ...prev,
        organizationSlug: newSlug,
      }));
    }
  }, [formData.organizationName, currentStep, formData.organizationSlug]);

  // Debounced slug-availability check
  useEffect(() => {
    // The checkSlugAvailability function now handles short/empty slugs internally
    if (formData.organizationSlug?.length >= 3) {
      const handler = setTimeout(() => {
        checkSlugAvailability(formData.organizationSlug);
      }, 500);
      return () => clearTimeout(handler);
    } else {
      // If slug is too short or empty, explicitly reset the check state
      resetSlugCheck();
    }
    // No return needed for the else branch as it doesn't set a timeout
  }, [formData.organizationSlug, checkSlugAvailability, resetSlugCheck]); // Add resetSlugCheck to dependencies

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => utilsHandleInputChange(prev, name, value));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setFormData((prev) => ({ ...prev, organizationSlug: suggestion }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.organizationSlug;
      return updated;
    });
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { isValid, error } = validateFile(file);
    if (!isValid) {
      setErrors((prev) => ({ ...prev, logoFile: error }));
      return;
    }

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.logoFile;
      return updated;
    });

    setLogoFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setLogoPreview(ev.target.result);
      }
    };
    reader.onerror = () => {
      CustomToast({
        message: 'Error reading file for preview.',
        type: 'error',
      });
      setLogoPreview(''); // Clear preview on error
    };
    reader.readAsDataURL(file);
  }, []);

  const handleNextStep = useCallback(() => {
    const { errors: stepErrors, isValid } = validateStep1(
      formData,
      slugAvailability,
    );
    if (!isValid) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  }, [formData, slugAvailability]);

  const handlePrevStep = useCallback(() => {
    setErrors({});
    setCurrentStep(1);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (currentStep === 1) {
        handleNextStep();
        return;
      }

      const { errors: step2Errors, isValid } = validateStep2(formData);
      if (!isValid) {
        setErrors(step2Errors);
        return;
      }

      const { success, error } = await submitOrganizationRequest(
        formData,
        logoFile,
      );

      if (success) {
        setFormData(initialFormData);
        setLogoFile(null);
        setLogoPreview('');
        setErrors({});
        setCurrentStep(1);

        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/user/Home'); // Adjust route as needed
        }
        return;
      }

      CustomToast({
        message:
          error?.message ||
          'Failed to submit organization request. Please try again.',
        type: 'error',
      });
    },
    [
      currentStep,
      formData,
      handleNextStep,
      initialFormData,
      isSubmitting,
      logoFile,
      onSuccess,
      router,
      submitOrganizationRequest,
    ],
  );

  const handleCancel = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setLogoFile(null);
    setLogoPreview('');
    setCurrentStep(1);

    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [initialFormData, onCancel, router]);

  const isSubmitDisabled = useMemo(() => {
    return isSubmitting || (currentStep === 1 && slugAvailability === false);
  }, [isSubmitting, currentStep, slugAvailability]);

  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return (
        <div className="flex items-center">
          <AqLoading01 className="animate-spin h-4 w-4 mr-2 text-white" />
          {currentStep === 1 ? 'Checking...' : 'Submitting...'}
        </div>
      );
    }
    return currentStep === 1 ? 'Continue' : 'Submit Request';
  }, [isSubmitting, currentStep]);

  return (
    <div className={`w-full max-w-4xl mx-auto overflow-x-hidden ${className}`}>
      {/* Progress indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center mb-4 w-full overflow-x-auto">
          <div className="flex items-center w-full max-w-xs mx-auto">
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
              className={`flex-1 h-1 mx-2 ${
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
        <div className="text-center px-2 sm:px-0">
          <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">
            {currentStep === 1 ? 'Organization Details' : 'Branding & Preview'}
          </h2>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark text-sm sm:text-base">
            {currentStep === 1
              ? 'Tell us about your organization to join the AirQo platform.'
              : 'Customize how your organization appears in the platform.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-0 sm:px-1.5">
        {currentStep === 1 ? (
          <div className="space-y-6">
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

            <div>
              <label
                htmlFor="organizationSlug"
                className="block text-sm font-medium text-text dark:text-text-dark mb-1"
              >
                Organization URL{' '}
                <span className="text-primary dark:text-primary/40">*</span>
              </label>
              <div className="flex flex-col sm:flex-row w-full">
                <span className="flex items-center px-4 py-2.5 border sm:border-r-0 border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm break-all rounded-t-xl sm:rounded-l-xl sm:rounded-r-none">
                  analytics.airqo.net/org/
                </span>
                <input
                  type="text"
                  id="organizationSlug"
                  name="organizationSlug"
                  placeholder="nairobi-air-lab"
                  value={formData.organizationSlug}
                  onChange={handleInputChange}
                  className={`flex-1 min-w-0 px-4 py-2.5 border border-t-0 sm:border-t sm:border-l-0 border-gray-400 dark:border-gray-500 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 ${
                    errors.organizationSlug
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-400 dark:focus:ring-red-400'
                      : 'focus:border-primary focus:ring-primary/50 dark:focus:border-primary-light dark:focus:ring-primary-light/50'
                  } rounded-b-xl sm:rounded-b-xl sm:rounded-l-none sm:rounded-r-xl`}
                  required
                />
              </div>

              {isCheckingSlug && (
                <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <AqLoading01 className="animate-spin h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Checking availability...
                </p>
              )}

              {!isCheckingSlug && formData.organizationSlug && (
                <div
                  className={`mt-1 text-sm flex items-center ${
                    slugAvailability === true
                      ? 'text-green-600 dark:text-green-400'
                      : slugAvailability === false
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {slugAvailability === true && (
                    <>
                      <AqCheck className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                      <span>{formData.organizationSlug} is available.</span>
                    </>
                  )}
                  {slugAvailability === false && (
                    <>
                      <AqXClose className="h-4 w-4 mr-1 text-red-600 dark:text-red-400" />
                      <span>{formData.organizationSlug} is already taken.</span>
                    </>
                  )}
                </div>
              )}

              {errors.organizationSlug && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.organizationSlug}
                </p>
              )}

              {slugSuggestions.length > 0 && slugAvailability === false && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Try one of these instead:
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {slugSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This will be your unique URL in the AirQo platform
              </p>
            </div>

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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                Organization Logo
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
                  errors.logoFile
                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    fileInputRef.current?.click();
                }}
                tabIndex="0"
                role="button"
                aria-label="Upload organization logo"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <AqImagePlus className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" />
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
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-destructive hover:text-destructive/80 text-sm"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            {logoPreview && (
              <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Logo Preview:
                </p>
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setLogoPreview('')}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="primary_color"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Primary Brand Color
                </label>
                <div className="flex flex-col sm:flex-row items-stretch">
                  <input
                    type="color"
                    id="primary_color"
                    name="branding_settings.primary_color"
                    value={formData.branding_settings.primary_color}
                    onChange={handleInputChange}
                    className="w-full sm:w-12 h-10 rounded-t-xl sm:rounded-l-xl border border-gray-400 dark:border-gray-600 cursor-pointer"
                    aria-label="Primary brand color"
                  />
                  <input
                    type="text"
                    placeholder="#135DFF"
                    value={formData.branding_settings.primary_color}
                    onChange={handleInputChange}
                    name="branding_settings.primary_color"
                    className={`sm:ml-2 flex-1 min-w-0 px-4 py-2.5 text-sm rounded-b-xl sm:rounded-b-xl sm:rounded-l-none border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors['branding_settings.primary_color']
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-400 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    aria-describedby={
                      errors['branding_settings.primary_color']
                        ? 'primary-color-error'
                        : undefined
                    }
                  />
                </div>
                {errors['branding_settings.primary_color'] && (
                  <p
                    id="primary-color-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
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
                <div className="flex flex-col sm:flex-row items-stretch">
                  <input
                    type="color"
                    id="secondary_color"
                    name="branding_settings.secondary_color"
                    value={formData.branding_settings.secondary_color}
                    onChange={handleInputChange}
                    className="w-full sm:w-12 h-10 rounded-t-xl sm:rounded-l-xl border border-gray-400 dark:border-gray-600 cursor-pointer"
                    aria-label="Secondary brand color"
                  />
                  <input
                    type="text"
                    placeholder="#1B2559"
                    value={formData.branding_settings.secondary_color}
                    onChange={handleInputChange}
                    name="branding_settings.secondary_color"
                    className={`sm:ml-2 flex-1 min-w-0 px-4 py-2.5 text-sm rounded-b-xl sm:rounded-b-xl sm:rounded-l-none border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors['branding_settings.secondary_color']
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-400 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    aria-describedby={
                      errors['branding_settings.secondary_color']
                        ? 'secondary-color-error'
                        : undefined
                    }
                  />
                </div>
                {errors['branding_settings.secondary_color'] && (
                  <p
                    id="secondary-color-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors['branding_settings.secondary_color']}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Your accent color (e.g., #FFFFFF for white)
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200 mb-2">
                Brand Preview
              </h3>
              <div
                className="flex items-center p-3 rounded-md overflow-x-auto"
                style={{
                  backgroundColor: formData.branding_settings.primary_color,
                }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Organization logo"
                    className="h-8 mr-3 bg-white p-1 rounded flex-shrink-0"
                  />
                ) : (
                  <div
                    className="h-8 w-8 mr-3 bg-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ color: formData.branding_settings.primary_color }}
                  >
                    {formData.organizationName
                      ? formData.organizationName.charAt(0).toUpperCase()
                      : 'O'}
                  </div>
                )}
                <span
                  className="font-medium text-sm truncate"
                  style={{ color: formData.branding_settings.secondary_color }}
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

        <div className="flex justify-between items-center gap-2 flex-wrap pt-6 border-t border-gray-200 dark:border-gray-700">
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
          <div className="flex gap-2 ml-auto">
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
              disabled={isSubmitDisabled}
              className="text-sm"
            >
              {submitButtonText}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganizationForm;
