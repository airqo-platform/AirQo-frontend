import { useState, useEffect, useRef } from 'react';
import { SettingsTabNavigation } from '@/common/components/Tabs';
import { AqGlobe02Maps_Travel, AqPalette, AqLink03 } from '@airqo/icons-react';
import OrganizationInformationForm from './OrganizationInformationForm';
import AppearanceSettingsForm from './AppearanceSettingsForm';
import DomainSettingsForm from './DomainSettingsForm';
import SettingsSidebar from './SettingsSidebar';
import CustomToast from '@/components/Toast/CustomToast';

const OrganizationSettingsContainer = ({
  formData,
  validationErrors,
  logoPreview,
  saveStatus,
  organizationDetails,
  hasUnsavedChanges = false,
  onInputChange,
  onSave,
  onReset,
  onFileSelect, // New prop to handle file selection
}) => {
  const [activeTab, setActiveTab] = useState('organization');
  const [appearanceData, setAppearanceData] = useState({
    theme: 'system',
    primaryColor: '#3B82F6',
  });
  const [isAppearanceUpdating, setIsAppearanceUpdating] = useState(false);
  const [appearanceHasUnsavedChanges, setAppearanceHasUnsavedChanges] =
    useState(false);
  const [isDomainUpdating, setIsDomainUpdating] = useState(false);
  const [domainHasUnsavedChanges, setDomainHasUnsavedChanges] = useState(false);
  // Ref for appearance form to access its save function
  const appearanceFormRef = useRef();
  // Ref for domain form to access its update function
  const domainFormRef = useRef();
  // Define organization settings tabs
  const organizationTabs = [
    {
      id: 'organization',
      name: 'Organization',
      icon: AqGlobe02Maps_Travel,
      description: 'Basic organization information and settings',
    },
    {
      id: 'domain',
      name: 'Domain',
      icon: AqLink03,
      description: 'Customize your organization URL',
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: AqPalette,
      description: 'Customize the look and feel',
    },
  ];
  // Handle toast notifications based on saveStatus
  useEffect(() => {
    if (saveStatus && saveStatus !== 'saving') {
      const getToastConfig = (status) => {
        switch (status) {
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

  const handleAppearanceUnsavedChanges = (hasChanges) => {
    setAppearanceHasUnsavedChanges(hasChanges);
  };
  const handleSave = () => {
    if (activeTab === 'appearance' && appearanceFormRef.current) {
      // Call the appearance form's save method
      appearanceFormRef.current.handleSave();
    } else {
      // Handle organization settings save
      onSave();
    }
  }; // Track appearance form updating state
  useEffect(() => {
    const checkFormUpdating = () => {
      // Appearance form tracking
      if (appearanceFormRef.current?.isUpdating !== undefined) {
        setIsAppearanceUpdating(appearanceFormRef.current.isUpdating);
      }
      if (appearanceFormRef.current?.hasUnsavedChanges !== undefined) {
        setAppearanceHasUnsavedChanges(
          appearanceFormRef.current.hasUnsavedChanges,
        );
      }

      // Domain form tracking
      if (domainFormRef.current?.isUpdating !== undefined) {
        setIsDomainUpdating(domainFormRef.current.isUpdating);
      }
      if (domainFormRef.current?.hasChanges !== undefined) {
        setDomainHasUnsavedChanges(domainFormRef.current.hasChanges);
      }
    };

    // Check immediately and set up interval to track changes
    checkFormUpdating();
    const interval = setInterval(checkFormUpdating, 50); // More frequent updates

    return () => clearInterval(interval);
  }, [activeTab]);
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <OrganizationInformationForm
            formData={formData}
            validationErrors={validationErrors}
            logoPreview={logoPreview}
            onInputChange={onInputChange}
            onFileSelect={onFileSelect} // Pass down the onFileSelect prop
          />
        );
      case 'domain':
        return <DomainSettingsForm ref={domainFormRef} />;
      case 'appearance':
        return (
          <AppearanceSettingsForm
            ref={appearanceFormRef}
            appearanceData={appearanceData}
            onAppearanceChange={handleAppearanceChange}
            onUnsavedChanges={handleAppearanceUnsavedChanges}
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
        <div className="lg:col-span-2">{renderActiveTabContent()}</div>{' '}
        {/* Side Panel */}
        <div className="lg:col-span-1">
          {' '}
          <SettingsSidebar
            onSave={handleSave}
            saveStatus={
              activeTab === 'appearance' && isAppearanceUpdating
                ? 'saving'
                : activeTab === 'domain' && isDomainUpdating
                  ? 'saving'
                  : saveStatus
            }
            organizationDetails={organizationDetails}
            activeTab={activeTab}
            isAppearanceUpdating={isAppearanceUpdating}
            hasUnsavedChanges={
              activeTab === 'organization'
                ? hasUnsavedChanges
                : activeTab === 'domain'
                  ? domainHasUnsavedChanges
                  : appearanceHasUnsavedChanges
            }
            onReset={activeTab === 'organization' ? onReset : undefined}
            domainFormRef={domainFormRef}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsContainer;
