'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/common/components/Button';
import CardWrapper from '@/common/components/CardWrapper';
import withOrgAuth from '@/core/HOC/withOrgAuth';

// Icons
import {
  FaPalette,
  FaGlobe,
  FaSave,
  FaShieldAlt,
  FaUpload,
  FaEye,
} from 'react-icons/fa';

const OrganizationSettingsPage = ({ params }) => {
  const router = useRouter();
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('organization');
  const [_saveStatus, setSaveStatus] = useState('');
  const [_logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [preferences, setPreferences] = useState({
    display: {
      theme: 'light',
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
  const _orgSlug = params?.org_slug || '';

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
      setLogoPreview(organization.logo || '');
      setPrimaryColor(organization.primaryColor || '#3B82F6');
      setIsLoading(false);
    }
  }, [organization]);

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      // Add API call to save settings
      // await saveOrganizationSettings(preferences, logoFile, primaryColor);      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleColorChange = (color) => {
    setPrimaryColor(color);
    // Apply color in real-time across all organization pages
    document.documentElement.style.setProperty('--org-primary', color);
    // Also update any other CSS custom properties that might be using the primary color
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleInputChange = (section, field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'organization', label: 'Organization', icon: FaGlobe },
    { id: 'display', label: 'Display', icon: FaPalette },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Organization Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your organization settings and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}{' '}
          <div className="w-64 flex-shrink-0">
            <CardWrapper className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      variant={activeTab === tab.id ? 'primary' : 'ghost'}
                      className={`w-full justify-start px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      Icon={IconComponent}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </nav>
            </CardWrapper>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            <CardWrapper className="p-6">
              {activeTab === 'organization' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Organization Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={preferences.organization.name}
                          onChange={(e) =>
                            handleInputChange(
                              'organization',
                              'name',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter organization name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Domain
                        </label>
                        <input
                          type="text"
                          value={preferences.organization.domain}
                          onChange={(e) =>
                            handleInputChange(
                              'organization',
                              'domain',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="organization.com"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={preferences.organization.description}
                        onChange={(e) =>
                          handleInputChange(
                            'organization',
                            'description',
                            e.target.value,
                          )
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Briefly describe your organization"
                      />
                    </div>

                    {/* Logo Upload Section */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Logo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Organization logo preview"
                              className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                              <FaUpload className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaUpload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, or SVG up to 2MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Primary Color Picker */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Theme Color
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                            placeholder="#3B82F6"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaEye className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Live Preview
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: primaryColor }}
                          ></div>
                          <span className="text-sm text-gray-600">
                            This color will be applied to buttons, links, and
                            highlights
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Display Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={preferences.display.theme}
                          onChange={(e) =>
                            handleInputChange(
                              'display',
                              'theme',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select
                          value={preferences.display.dateFormat}
                          onChange={(e) =>
                            handleInputChange(
                              'display',
                              'dateFormat',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Privacy Settings
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Make data public
                          </label>
                          <p className="text-sm text-gray-500">
                            Allow public access to your organization&apos;s data
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.privacy.publicData}
                          onChange={(e) =>
                            handleInputChange(
                              'privacy',
                              'publicData',
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Share analytics
                          </label>
                          <p className="text-sm text-gray-500">
                            Help us improve by sharing usage analytics
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.privacy.shareAnalytics}
                          onChange={(e) =>
                            handleInputChange(
                              'privacy',
                              'shareAnalytics',
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data Retention Period
                        </label>
                        <select
                          value={preferences.privacy.dataRetention}
                          onChange={(e) =>
                            handleInputChange(
                              'privacy',
                              'dataRetention',
                              e.target.value,
                            )
                          }
                          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="6months">6 Months</option>
                          <option value="1year">1 Year</option>
                          <option value="2years">2 Years</option>
                          <option value="forever">Forever</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex items-center">
                    <FaSave className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withOrgAuth(OrganizationSettingsPage);
