'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountPageLayout from '@/components/Account/Layout';
import Spinner from '@/components/Spinner';

export default function OrgRequestAccessPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    organizationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    organizationType: '',
    useCase: '',
    additionalInfo: '',

    // Step 2: Branding Settings
    organizationSlug: '',
    branding_settings: {
      logo_url: '',
      primary_color: '#004080',
      secondary_color: '#FFFFFF',
    },
  });
  const [errors, setErrors] = useState({});

  // Generate slug from organization name
  useEffect(() => {
    if (
      formData.organizationName &&
      currentStep === 2 &&
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
      // Handle nested properties (branding_settings)
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

    // Validate file type
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

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        logoFile: 'Image file size must be less than 2MB',
      });
      return;
    }

    // Clear any previous errors
    if (errors.logoFile) {
      const newErrors = { ...errors };
      delete newErrors.logoFile;
      setErrors(newErrors);
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear the URL input since we're using a file
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.organizationSlug.trim()) {
      newErrors.organizationSlug = 'Organization URL is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.organizationSlug)) {
      newErrors.organizationSlug =
        'URL can only contain lowercase letters, numbers, and hyphens';
    }

    // Either a logo file or URL is optional, but if URL is provided, it should be valid
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

    // Validate color format
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(formData.branding_settings.primary_color)) {
      newErrors['branding_settings.primary_color'] =
        'Please enter a valid hex color code';
    }

    if (!colorRegex.test(formData.branding_settings.secondary_color)) {
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

  // Simulate uploading to Cloudinary
  const uploadToCloudinary = async (file) => {
    // In a real application, this would be an actual API call to Cloudinary
    // For this example, we'll simulate the upload process

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate Cloudinary response with a URL
    // In a real app, you would get this URL from the Cloudinary API response
    return {
      secure_url: `https://res.cloudinary.com/demo/image/upload/${Date.now()}-${file.name.replace(/\s+/g, '-')}`,
    };
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
      //   let finalFormData = { ...formData };

      //   // If a logo file was selected, upload it to Cloudinary
      //   if (logoFile) {
      //     try {
      //       const cloudinaryResponse = await uploadToCloudinary(logoFile);

      //       // Update the form data with the Cloudinary URL
      //       finalFormData = {
      //         ...finalFormData,
      //         branding_settings: {
      //           ...finalFormData.branding_settings,
      //           logo_url: cloudinaryResponse.secure_url,
      //         },
      //       };
      //     } catch (uploadError) {
      //       console.error('Error uploading logo:', uploadError);
      //       setErrors({
      //         ...errors,
      //         logoFile: 'Failed to upload logo. Please try again.',
      //       });
      //       setIsSubmitting(false);
      //       return;
      //     }
      //   }

      // In a real application, this would be an API call to your backend
      // await fetch('/api/org-requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(finalFormData),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to confirmation page
      router.replace(
        '/account/creation/organisation/request-access/confirmation',
      );
    } catch (error) {
      // Handle error (in a real app)
      //   console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview logo when URL changes
  useEffect(() => {
    if (!logoFile && formData.branding_settings.logo_url) {
      setLogoPreview(formData.branding_settings.logo_url);
    } else if (!formData.branding_settings.logo_url && !logoFile) {
      setLogoPreview('');
    }
  }, [formData.branding_settings.logo_url, logoFile]);

  return (
    <AccountPageLayout
      childrenHeight={'lg:h-[680]'}
      childrenTop={'mt-20'}
      rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
      pageTitle={'Request Organization Access | AirQo'}
    >
      <div>
        <div>
          {currentStep === 1 ? (
            <div>
              <h2 className="text-3xl text-black-700 font-medium">
                Request Organization Access
              </h2>
              <p className="text-xl text-black-700 font-normal mt-3">
                Fill out the form below to request access to AirQo for your
                organization.
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 ? (
                <>
                  <div>
                    <label
                      htmlFor="organizationName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Organization Name
                      <span className="text-red-500 ml-1">*</span>
                      <span
                        className="inline-block ml-1 cursor-help"
                        title="The official name of your organization"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="organizationName"
                      name="organizationName"
                      placeholder="Nairobi Air Lab"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.organizationName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.organizationName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.organizationName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="contactName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        placeholder="John Doe"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.contactName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.contactName ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactName}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          The primary contact person for this request
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contactEmail"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Email
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        placeholder="johndoe@example.com"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.contactEmail ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactEmail}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          We&apos;ll send approval notifications to this email
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="contactPhone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Phone
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        placeholder="+254 123 456 789"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.contactPhone ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactPhone}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          A phone number where we can reach you
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.country ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.country ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.country}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          The country where your organization is based
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="organizationType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Organization Type
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="organizationType"
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.organizationType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
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
                    {errors.organizationType ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.organizationType}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Select the type that best describes your organization
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="useCase"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Use Case
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      id="useCase"
                      name="useCase"
                      placeholder="We plan to deploy air quality monitors across Nairobi to monitor pollution levels..."
                      value={formData.useCase}
                      onChange={handleInputChange}
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-md ${errors.useCase ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    ></textarea>
                    {errors.useCase ? (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.useCase}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Describe how your organization plans to use AirQo
                        platform
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    style={{ textTransform: 'none' }}
                    disabled={isSubmitting}
                    className={`w-full btn text-sm outline-none border-none rounded-[12px] bg-blue-900 text-white hover:bg-blue-950 transition-colors ${isSubmitting ? 'btn-disabled bg-white' : ''}`}
                  >
                    {isSubmitting ? (
                      <Spinner width={25} height={25} />
                    ) : (
                      'Continue'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="organizationSlug"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Organization URL
                      <span className="text-red-500 ml-1">*</span>
                      <span
                        className="inline-block ml-1 cursor-help"
                        title="This will be used in your organization's unique URL"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </span>
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 px-3 py-2 text-gray-500 border border-r-0 border-gray-300 rounded-l-md">
                        analytics.airqo.net/
                      </span>
                      <input
                        type="text"
                        id="organizationSlug"
                        name="organizationSlug"
                        placeholder={formData.organizationSlug ?? ''}
                        value={formData.organizationSlug}
                        onChange={handleInputChange}
                        className={`flex-1 px-3 py-2 border rounded-r-md ${errors.organizationSlug ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Logo
                      <span
                        className="inline-block ml-1 cursor-help"
                        title="Upload your organization's logo or provide a URL"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </span>
                    </label>

                    {/* File Upload Option */}
                    <div className="mb-4">
                      <div
                        className={`border-2 border-dashed rounded-md p-4 text-center ${
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
                      <input
                        type="url"
                        id="logo_url"
                        name="branding_settings.logo_url"
                        placeholder="https://example.com/your-logo.png"
                        value={formData.branding_settings.logo_url}
                        onChange={handleInputChange}
                        disabled={!!logoFile}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors['branding_settings.logo_url']
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          logoFile ? 'bg-gray-100 text-gray-500' : ''
                        }`}
                      />
                      {errors['branding_settings.logo_url'] ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors['branding_settings.logo_url']}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Enter a direct URL to your organization&apos;s logo
                          (PNG, JPG, or SVG format recommended)
                        </p>
                      )}
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

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        htmlFor="primary_color"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Primary Brand Color
                        <span className="text-red-500 ml-1">*</span>
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
                          className={`ml-2 flex-1 px-3 py-2 border rounded-md ${errors['branding_settings.primary_color'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      {errors['branding_settings.primary_color'] ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors['branding_settings.primary_color']}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Your main brand color (e.g., #004080 for dark blue)
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="secondary_color"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Secondary Brand Color
                        <span className="text-red-500 ml-1">*</span>
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
                        <input
                          type="text"
                          aria-label="Secondary color hex code"
                          name="branding_settings.secondary_color"
                          value={formData.branding_settings.secondary_color}
                          onChange={handleInputChange}
                          className={`ml-2 flex-1 px-3 py-2 border rounded-md ${errors['branding_settings.secondary_color'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      {errors['branding_settings.secondary_color'] ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors['branding_settings.secondary_color']}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Your accent color (e.g., #FFFFFF for white)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">
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
                        className="font-medium"
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
                      disabled={isSubmitting}
                      className={`w-[50%] btn text-sm outline-none border-none rounded-[12px] bg-blue-900 text-white hover:bg-blue-950 transition-colors ${isSubmitting ? 'btn-disabled bg-white' : ''}`}
                    >
                      {isSubmitting ? (
                        <Spinner width={25} height={25} />
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-500">
              By submitting this form, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </AccountPageLayout>
  );
}
