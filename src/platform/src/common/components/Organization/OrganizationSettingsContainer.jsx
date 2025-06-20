import React, { useState, useEffect, useRef } from 'react';
import { SettingsTabNavigation } from '@/common/components/Tabs';
import { FaGlobe, FaPalette } from 'react-icons/fa';
import OrganizationInformationForm from './OrganizationInformationForm';
import AppearanceSettingsForm from './AppearanceSettingsForm';
import SettingsSidebar from './SettingsSidebar';
import CustomToast from '@/components/Toast/CustomToast';

const OrganizationSettingsContainer = ({
  formData,
  validationErrors,
  logoPreview,
  saveStatus,
  organizationDetails,
  onInputChange,
  onLogoUpload,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState('organization');
  const [appearanceData, setAppearanceData] = useState({
    theme: 'system',
    primaryColor: '#3B82F6',
  });

  // Ref for appearance form to access its save function
  const appearanceFormRef = useRef();

  // Define organization settings tabs
  const organizationTabs = [
    {
      id: 'organization',
      name: 'Organization',
      icon: FaGlobe,
      description: 'Basic organization information and settings',
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: FaPalette,
      description: 'Customize the look and feel',
    },
  ];

  // Handle toast notifications based on saveStatus
  useEffect(() => {
    if (saveStatus) {
      const getToastConfig = (status) => {
        switch (status) {
          case 'saving':
            return { message: 'Saving changes...', type: 'info' };
          case 'success':
            return { message: 'Changes saved successfully!', type: 'success' };
          case 'invalid-file-type':
            return {
              message:
                'Invalid file type. Please upload JPG, PNG, or SVG images only.',
              type: 'error',
            };
          case 'file-too-large':
            return {
              message: 'File too large. Please upload images smaller than 5MB.',
              type: 'error',
            };
          case 'validation-error':
            return {
              message: 'Please fix the validation errors and try again.',
              type: 'warning',
            };
          case 'error':
          default:
            return {
              message: 'Failed to save changes. Please try again.',
              type: 'error',
            };
        }
      };

      const { message, type } = getToastConfig(saveStatus);
      CustomToast({ message, type });
    }
  }, [saveStatus]);

  const handleAppearanceChange = (field, value) => {
    setAppearanceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSave = () => {
    if (activeTab === 'appearance' && appearanceFormRef.current) {
      // Call the appearance form's save method
      appearanceFormRef.current.handleSave();
    } else {
      // Handle organization settings save
      onSave();
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <OrganizationInformationForm
            formData={formData}
            validationErrors={validationErrors}
            logoPreview={logoPreview}
            onInputChange={onInputChange}
            onLogoUpload={onLogoUpload}
          />
        );
      case 'appearance':
        return (
          <AppearanceSettingsForm
            ref={appearanceFormRef}
            appearanceData={appearanceData}
            onAppearanceChange={handleAppearanceChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {' '}
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Organization Settings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your organization settings and preferences
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <SettingsTabNavigation
        tabs={organizationTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">{renderActiveTabContent()}</div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          <SettingsSidebar
            onSave={handleSave}
            saveStatus={saveStatus}
            organizationDetails={organizationDetails}
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsContainer;
