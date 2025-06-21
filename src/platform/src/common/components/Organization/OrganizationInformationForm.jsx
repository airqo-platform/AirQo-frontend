import React, { useState, useCallback, useMemo } from 'react';
import { FaGlobe, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import InputField from '@/common/components/InputField';
import TextField from '@/common/components/TextInputField';
import SelectDropdown from '@/components/SelectDropdown';
import CardWrapper from '@/common/components/CardWrapper';
import CustomToast from '@/components/Toast/CustomToast';
import GroupLogo from '@/common/components/GroupLogo';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import timeZones from 'timezones.json';

// Setup countries
countries.registerLocale(enLocale);
const countryObj = countries.getNames('en', { select: 'official' });

// Industry options as requested (including existing data values)
const industryOptions = [
  'Textiles',
  'Transport',
  'Healthcare',
  'Health', // Add this to match existing data
  'Manufacturing',
  'Agriculture',
  'Information Technology',
  'Policy & Government',
  'Education & Research',
  'Business',
  'Mining',
  'Hospitality',
  'Food and Catering',
  'Media & Journalism',
].map((industry) => ({
  label: industry,
  value: industry,
}));

// Convert country object to array format for SelectDropdown
// Support both country names and country codes for backward compatibility
const countryOptions = Object.values(countryObj).map((name) => ({
  label: name,
  value: name, // Use country name as value to match existing data format
}));

// Convert timezone data to proper format
// Create a mapping that includes both timezone identifiers and text
const createTimezoneOptions = () => {
  // Create options from timezones.json
  const options = timeZones.map((tz) => ({
    label: tz.text,
    value: tz.text,
  }));

  // Add timezone identifiers that might be in the data
  const timezoneIdentifiers = [
    { label: 'Africa/Banjul - West Africa Time', value: 'Africa/Banjul' },
    { label: 'Africa/Lagos - West Africa Time', value: 'Africa/Lagos' },
    { label: 'Africa/Cairo - Eastern European Time', value: 'Africa/Cairo' },
    { label: 'Africa/Nairobi - East Africa Time', value: 'Africa/Nairobi' },
    {
      label: 'Africa/Johannesburg - South Africa Standard Time',
      value: 'Africa/Johannesburg',
    },
    { label: 'Europe/London - Greenwich Mean Time', value: 'Europe/London' },
    {
      label: 'America/New_York - Eastern Standard Time',
      value: 'America/New_York',
    },
    {
      label: 'America/Los_Angeles - Pacific Standard Time',
      value: 'America/Los_Angeles',
    },
    { label: 'Asia/Tokyo - Japan Standard Time', value: 'Asia/Tokyo' },
    {
      label: 'Australia/Sydney - Australian Eastern Standard Time',
      value: 'Australia/Sydney',
    },
  ];

  // Merge both formats to support existing data
  const allOptions = [...options, ...timezoneIdentifiers];
  const uniqueOptions = allOptions.filter(
    (option, index, self) =>
      index === self.findIndex((t) => t.value === option.value),
  );

  return uniqueOptions.sort((a, b) => a.label.localeCompare(b.label));
};

const timezoneOptions = createTimezoneOptions();

const OrganizationInformationForm = ({
  formData,
  validationErrors,
  logoPreview,
  onInputChange,
}) => {
  const [imageError, setImageError] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState(null);

  // Handle logo file upload and Cloudinary upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      CustomToast({
        message: 'Please upload a valid image file (PNG, JPG, SVG, WEBP)',
        type: 'error',
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      CustomToast({
        message: 'File size must be less than 5MB',
        type: 'error',
      });
      return;
    } // Create local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalImagePreview(e.target.result);
      setImageError(false); // Reset any previous image errors
    };
    reader.readAsDataURL(file);

    setUploadingLogo(true);

    try {
      // Upload to Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'ml_default',
      );
      uploadFormData.append('folder', 'organization_profiles');
      const responseData = await cloudinaryImageUpload(uploadFormData);

      // Extract the secure_url from the Cloudinary response
      const cloudinaryUrl = responseData?.secure_url;
      if (cloudinaryUrl) {
        // Update the organization data with the Cloudinary URL (for API body)
        onInputChange('grp_profile_picture', cloudinaryUrl);
        onInputChange('grp_image', cloudinaryUrl);

        // Replace local preview with Cloudinary URL after successful upload
        setLocalImagePreview(cloudinaryUrl);

        // Show success message
        CustomToast({
          message: 'Logo uploaded successfully! Click Save to apply changes.',
          type: 'success',
        });
      } else {
        // Handle case where Cloudinary response doesn't contain secure_url
        CustomToast({
          message:
            'Upload completed but failed to get image URL. Please try again.',
          type: 'error',
        });
        throw new Error('Failed to get secure URL from Cloudinary response');
      }
    } catch {
      // Handle upload error - keep local preview but show error
      CustomToast({
        message:
          'Failed to upload logo to cloud storage. The preview is shown locally, but please try uploading again.',
        type: 'error',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handlers for SelectDropdown fields (matching user settings pattern)
  const handleIndustryChange = (option) => {
    onInputChange('grp_industry', option.value);
  };

  const handleCountryChange = (option) => {
    onInputChange('grp_country', option.value);
  };

  const handleTimezoneChange = (option) => {
    onInputChange('grp_timezone', option.value);
  };

  // Generate organization initials and color for fallback
  const organizationDisplay = useMemo(() => {
    const title = formData.grp_title || 'Organization';

    // Generate initials (max 2 characters)
    const words = title.trim().split(/\s+/);
    let initials;

    if (words.length === 1) {
      initials = words[0].substring(0, 2).toUpperCase();
    } else {
      initials = words
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
    }

    // Generate consistent color based on organization name
    const generateColor = (str) => {
      const colors = [
        '#3B82F6',
        '#10B981',
        '#8B5CF6',
        '#F59E0B',
        '#EF4444',
        '#06B6D4',
        '#84CC16',
        '#EC4899',
        '#6366F1',
        '#14B8A6',
      ];

      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    };

    return {
      initials,
      color: generateColor(title),
      title,
    };
  }, [formData.grp_title]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  // Professional logo display component with improved preview logic
  const LogoDisplay = () => {
    // Priority order for image source:
    // 1. Local preview (when user just selected a file)
    // 2. External logoPreview prop (for backward compatibility)
    // 3. Cloudinary URL from formData (grp_profile_picture or grp_image)
    // 4. Fallback to initials
    const getImageSource = () => {
      if (localImagePreview) return localImagePreview;
      if (logoPreview) return logoPreview;
      if (formData.grp_profile_picture) return formData.grp_profile_picture;
      if (formData.grp_image) return formData.grp_image;
      return null;
    };

    const imageUrl = getImageSource();

    if (imageUrl && !imageError) {
      return (
        <div className="relative h-16 w-16 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
          <Image
            src={imageUrl}
            alt="Organization logo"
            fill
            sizes="64px"
            className="object-contain p-1"
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority={false}
            loading="lazy"
          />
        </div>
      );
    }

    // Professional fallback - Organization initials badge
    return (
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white dark:ring-gray-800 text-lg"
        style={{ backgroundColor: organizationDisplay.color }}
        title={organizationDisplay.title}
      >
        {organizationDisplay.initials}
      </div>
    );
  };

  return (
    <CardWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaGlobe className="mr-2 text-primary" />
            Organization Information
          </h2>{' '}
        </div>{' '}
        {/* Topbar Preview Section - Shows only when user uploads an image */}
        {localImagePreview && (
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative h-8 w-8 bg-white rounded shadow-sm border overflow-hidden">
                  <Image
                    src={localImagePreview}
                    alt="Logo preview"
                    fill
                    sizes="32px"
                    className="object-contain p-1"
                    loading="lazy"
                    onError={() => {}}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.grp_title || 'Your Organization'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Topbar preview
                  </p>
                </div>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {' '}
                ✓ Logo uploaded
              </div>
            </div>
          </div>
        )}
        {/* Logo Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <LogoDisplay />
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, SVG, WEBP formats supported. Max size: 5MB.
                </p>
                {uploadingLogo && (
                  <div className="flex items-center text-xs text-primary">
                    <FaSpinner className="animate-spin mr-1" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Organization Name"
            value={formData.grp_title}
            onChange={(value) => onInputChange('grp_title', value)}
            placeholder="Enter organization name"
            error={validationErrors.grp_title}
            required
          />

          <InputField
            label="Website"
            value={formData.grp_website}
            onChange={(value) => onInputChange('grp_website', value)}
            placeholder="https://example.com"
            error={validationErrors.grp_website}
            required
          />
        </div>{' '}
        <TextField
          label="Description"
          value={formData.grp_description}
          onChange={(e) => onInputChange('grp_description', e.target.value)}
          placeholder="Describe your organization"
          rows={4}
          error={validationErrors.grp_description}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry Field */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
              Industry
              <span className="ml-1 text-primary">*</span>
            </label>
            <SelectDropdown
              items={industryOptions}
              selected={
                industryOptions.find(
                  (option) => option.value === formData.grp_industry,
                ) || null
              }
              onChange={handleIndustryChange}
              placeholder="Select industry"
              error={validationErrors.grp_industry}
              required
            />
          </div>

          {/* Country Field */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
              Country
              <span className="ml-1 text-primary">*</span>
            </label>
            <SelectDropdown
              items={countryOptions}
              selected={
                countryOptions.find(
                  (option) => option.value === formData.grp_country,
                ) || null
              }
              onChange={handleCountryChange}
              placeholder="Select country"
              error={validationErrors.grp_country}
              required
            />
          </div>
        </div>
        {/* Timezone Field */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
            Timezone
            <span className="ml-1 text-primary">*</span>
          </label>
          <SelectDropdown
            items={timezoneOptions}
            selected={
              timezoneOptions.find(
                (option) => option.value === formData.grp_timezone,
              ) || null
            }
            onChange={handleTimezoneChange}
            placeholder="Select timezone"
            error={validationErrors.grp_timezone}
            required
          />
        </div>
        {/* Topbar Preview Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Topbar Logo Preview
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <GroupLogo
                logoUrl={
                  localImagePreview ||
                  logoPreview ||
                  formData.grp_profile_picture ||
                  formData.grp_image
                }
                organizationName={formData.grp_title}
                className="h-12 w-12"
              />
            </div>
            <div className="flex-1">
              {' '}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is how your logo will appear in the platform&apos;s topbar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default OrganizationInformationForm;
