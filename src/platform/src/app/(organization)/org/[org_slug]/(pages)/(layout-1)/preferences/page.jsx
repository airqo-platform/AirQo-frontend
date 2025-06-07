'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import CardWrapper from '@/common/components/CardWrapper';
import withOrgAuth from '@/core/HOC/withOrgAuth';

// Icons
import {
  FaUser,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaGlobe,
  FaSave,
} from 'react-icons/fa';

const OrganizationPreferencesPage = ({ params }) => {
  const router = useRouter();
  const { organization, primaryColor } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      alerts: true,
      reports: true,
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
    },
    organization: {
      name: '',
      description: '',
      domain: '',
      logo: '',
    },
    privacy: {
      publicData: false,
      shareAnalytics: true,
      dataRetention: '1year',
    },
  });

  const orgSlug = params?.org_slug || '';

  useEffect(() => {
    if (organization) {
      setPreferences((prev) => ({
        ...prev,
        organization: {
          name: organization.name || '',
          description: organization.description || '',
          domain: organization.domain || '',
          logo: organization.logo || '',
        },
      }));
      setIsLoading(false);
    }
  }, [organization]);

  const tabs = [
    { id: 'general', name: 'General', icon: FaUser },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'appearance', name: 'Appearance', icon: FaPalette },
    { id: 'privacy', name: 'Privacy', icon: FaShieldAlt },
    { id: 'organization', name: 'Organization', icon: FaGlobe },
  ];

  const handleSave = async () => {
    // In a real application, this would save to the backend
    // Show success message
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Preferences saved successfully!');
    }
  };

  const TabButton = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => onClick(tab.id)}
        className={`
          w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
          ${
            isActive
              ? 'text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
        style={{
          backgroundColor: isActive ? primaryColor : 'transparent',
        }}
      >
        <Icon className="w-4 h-4 mr-3" />
        {tab.name}
      </button>
    );
  };

  const InputField = ({ label, value, onChange, placeholder, description }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );

  const SelectField = ({ label, value, onChange, options, description }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );

  const ToggleField = ({ label, checked, onChange, description }) => (
    <div className="flex items-start">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <div className="ml-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              General Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Language"
                value={preferences.display.language}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    display: { ...prev.display, language: e.target.value },
                  }))
                }
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'French' },
                  { value: 'es', label: 'Spanish' },
                ]}
                description="Select your preferred language"
              />
              <SelectField
                label="Timezone"
                value={preferences.display.timezone}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    display: { ...prev.display, timezone: e.target.value },
                  }))
                }
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'EST', label: 'Eastern Time' },
                  { value: 'PST', label: 'Pacific Time' },
                ]}
                description="Choose your timezone"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Notification Settings
            </h3>
            <div className="space-y-4">
              <ToggleField
                label="Email Notifications"
                checked={preferences.notifications.email}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      email: e.target.checked,
                    },
                  }))
                }
                description="Receive notifications via email"
              />
              <ToggleField
                label="SMS Notifications"
                checked={preferences.notifications.sms}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      sms: e.target.checked,
                    },
                  }))
                }
                description="Receive notifications via SMS"
              />
              <ToggleField
                label="Alert Notifications"
                checked={preferences.notifications.alerts}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      alerts: e.target.checked,
                    },
                  }))
                }
                description="Get notified about air quality alerts"
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Appearance Settings
            </h3>
            <div className="space-y-6">
              <SelectField
                label="Theme"
                value={preferences.display.theme}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    display: { ...prev.display, theme: e.target.value },
                  }))
                }
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' },
                ]}
                description="Choose your preferred theme"
              />
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Organization Theme
                </h4>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-sm text-gray-600">
                    Current organization theme color
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Privacy Settings
            </h3>
            <div className="space-y-4">
              <ToggleField
                label="Public Data"
                checked={preferences.privacy.publicData}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, publicData: e.target.checked },
                  }))
                }
                description="Make your data publicly visible"
              />
              <ToggleField
                label="Share Analytics"
                checked={preferences.privacy.shareAnalytics}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      shareAnalytics: e.target.checked,
                    },
                  }))
                }
                description="Share usage analytics to improve the platform"
              />
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Organization Information
            </h3>
            <div className="space-y-6">
              <InputField
                label="Organization Name"
                value={preferences.organization.name}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    organization: {
                      ...prev.organization,
                      name: e.target.value,
                    },
                  }))
                }
                placeholder="Enter organization name"
                description="The display name for your organization"
              />
              <InputField
                label="Description"
                value={preferences.organization.description}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    organization: {
                      ...prev.organization,
                      description: e.target.value,
                    },
                  }))
                }
                placeholder="Enter organization description"
                description="A brief description of your organization"
              />
              <InputField
                label="Domain"
                value={preferences.organization.domain}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    organization: {
                      ...prev.organization,
                      domain: e.target.value,
                    },
                  }))
                }
                placeholder="example.com"
                description="Your organization's domain name"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <CardWrapper
        title={`${organization.name} - Preferences`}
        subtitle="Manage your organization settings and preferences"
        padding="p-6"
      />

      {/* Content */}
      <CardWrapper className="overflow-hidden" padding="p-0">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">{renderTabContent()}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/org/${orgSlug}/dashboard`)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} Icon={FaSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </CardWrapper>
    </div>
  );
};

export default withOrgAuth(OrganizationPreferencesPage);
