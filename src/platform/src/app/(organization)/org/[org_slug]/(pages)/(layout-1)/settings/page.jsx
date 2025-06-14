'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@/common/components/Button';
import CardWrapper from '@/common/components/CardWrapper';
import { withOrgAuth } from '@/core/HOC';
import { updateGroupDetailsApi } from '@/core/apis/Account';
import {
  fetchGroupDetails,
  updateGroupLogo,
} from '@/lib/store/services/groups';

// Icons
import {
  FaPalette,
  FaGlobe,
  FaSave,
  FaShieldAlt,
  FaUpload,
  FaEye,
} from 'react-icons/fa';

const OrganizationSettingsPage = () => {
  const dispatch = useDispatch();
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('organization');
  const [saveStatus, setSaveStatus] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [preferences, setPreferences] = useState({
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

      // Prepare the data for API call
      const updateData = {
        grp_title: preferences.organization.name,
        grp_description: preferences.organization.description,
        grp_domain: preferences.organization.domain,
        grp_privacy: preferences.privacy.publicData ? 'public' : 'private',
        share_analytics: preferences.privacy.shareAnalytics,
        data_retention: preferences.privacy.dataRetention,
        primary_color: primaryColor,
      };

      // Handle logo upload if there's a new file
      if (logoFile) {
        const formData = new FormData();
        formData.append('grp_image', logoFile);

        // Add other fields to form data
        Object.keys(updateData).forEach((key) => {
          formData.append(key, updateData[key]);
        });

        // Update with FormData (includes logo)
        await updateGroupDetailsApi(organization.grp_id, formData);

        // Update Redux store immediately with new logo URL
        dispatch(updateGroupLogo(logoPreview));

        // Dispatch custom event to notify all GroupLogo components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new window.Event('logoRefresh'));
        }
      } else {
        // Update without logo
        await updateGroupDetailsApi(organization.grp_id, updateData);
      }

      // Refresh group info to update logo across the app immediately
      if (organization.grp_id) {
        await dispatch(fetchGroupDetails(organization.grp_id)).unwrap();
      }

      // Clear cached logo to force refresh
      try {
        localStorage.removeItem('groupLogoUrl');
      } catch {
        // Failed to clear cache, continue anyway
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);

      // If logo was updated, trigger refresh event instead of full page reload
      if (logoFile) {
        // Give a small delay to let the API call complete
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new window.Event('logoRefresh'));
          }
        }, 500);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file type and size
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/svg+xml',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setSaveStatus('invalid-file-type');
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }

      if (file.size > maxSize) {
        setSaveStatus('file-too-large');
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogoUrl = e.target.result;
        setLogoPreview(newLogoUrl);

        // Update preferences to reflect the change
        handleInputChange('organization', 'logo', newLogoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    // Apply color in real-time across the entire application
    const root = document.documentElement;

    // Update all possible CSS custom properties for primary color
    root.style.setProperty('--color-primary', color);
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--org-primary', color);

    // Convert hex to RGB for CSS properties that need RGB values
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgb = hexToRgb(color);

    if (rgb) {
      root.style.setProperty(
        '--color-primary-rgb',
        `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      );
      root.style.setProperty(
        '--primary-color-rgb',
        `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      );
    }

    // Update theme customizer if available
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new window.CustomEvent('themeColorChange', {
          detail: { primaryColor: color },
        }),
      );
    }
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
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1d1f20] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organization Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your organization settings and preferences
          </p>
        </div>

        {/* Status Messages */}
        {saveStatus && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              saveStatus === 'saving'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : saveStatus === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : saveStatus === 'invalid-file-type'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : saveStatus === 'file-too-large'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center">
              {saveStatus === 'saving' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>Saving changes...</span>
                </>
              )}
              {saveStatus === 'success' && (
                <>
                  <FaSave className="mr-2" />
                  <span>Changes saved successfully!</span>
                </>
              )}
              {saveStatus === 'invalid-file-type' && (
                <>
                  <span className="mr-2">⚠️</span>
                  <span>
                    Invalid file type. Please upload JPG, PNG, or SVG images
                    only.
                  </span>
                </>
              )}
              {saveStatus === 'file-too-large' && (
                <>
                  <span className="mr-2">⚠️</span>
                  <span>
                    File too large. Please upload images smaller than 5MB.
                  </span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <span className="mr-2">❌</span>
                  <span>Failed to save changes. Please try again.</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CardWrapper padding="p-0" className="overflow-hidden">
              <div className="p-6">
                {activeTab === 'organization' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Organization Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter organization name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="organization.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Describe your organization"
                      />
                    </div>

                    {/* Logo Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Organization Logo
                      </label>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-16 w-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                              <FaUpload className="h-6 w-6 text-gray-400 dark:text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                            onChange={handleLogoUpload}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, SVG up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Appearance & Branding
                      </h2>
                    </div>

                    {/* Primary Color Picker */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="#3B82F6"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This color will be used for buttons, links, and other
                        primary elements
                      </p>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <FaEye className="inline mr-2" />
                        Live Preview
                      </h3>
                      <div className="space-y-3">
                        <button
                          style={{ backgroundColor: primaryColor }}
                          className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                        >
                          Primary Button
                        </button>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Link color:
                          </span>
                          <span
                            style={{ color: primaryColor }}
                            className="text-sm font-medium hover:underline cursor-pointer"
                          >
                            Sample Link
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Accent color:
                          </span>
                          <div
                            style={{ borderColor: primaryColor }}
                            className="h-4 w-4 rounded border-2"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Privacy Settings
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Public Data
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Make organization data publicly accessible
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Share Analytics
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Share usage analytics to help improve the platform
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Data Retention
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="6months">6 Months</option>
                          <option value="1year">1 Year</option>
                          <option value="2years">2 Years</option>
                          <option value="forever">Forever</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardWrapper>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <CardWrapper padding="p-0" className="overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h3>
                <div className="space-y-4">
                  <Button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    variant="filled"
                    className="w-full flex items-center justify-center"
                  >
                    <FaSave className="mr-2 h-4 w-4" />
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                  </Button>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      💡 Pro Tips
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Colors update instantly across the platform</li>
                      <li>• Logo changes reflect immediately</li>
                      <li>• Privacy settings affect data visibility</li>
                    </ul>
                  </div>
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
