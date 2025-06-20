import React, { useState, useCallback, useMemo } from 'react';
import { FaGlobe, FaUpload } from 'react-icons/fa';
import Image from 'next/image';
import InputField from '@/common/components/InputField';
import TextField from '@/common/components/TextInputField';
import SelectDropdown from '@/components/SelectDropdown';
import CardWrapper from '@/common/components/CardWrapper';
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
const countryOptions = Object.entries(countryObj).map(([code, name]) => ({
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
  onLogoUpload,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
    setImageLoading(false);
  }, []);

  // Professional logo display component
  const LogoDisplay = () => {
    if (logoPreview && !imageError) {
      return (
        <div className="relative h-16 w-16 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
          <Image
            src={logoPreview}
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
        {' '}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaGlobe className="mr-2 text-primary" />
            Organization Information
          </h2>
        </div>{' '}
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
                accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                onChange={onLogoUpload}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>
          </div>
        </div>{' '}
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
        </div>
        <TextField
          label="Description"
          value={formData.grp_description}
          onChange={(value) => onInputChange('grp_description', value)}
          placeholder="Describe your organization"
          rows={4}
          error={validationErrors.grp_description}
          required
        />{' '}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Industry Field */}
          <div className="flex flex-col">
            {' '}
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
            {' '}
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
          {' '}
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
      </div>
    </CardWrapper>
  );
};

export default OrganizationInformationForm;
