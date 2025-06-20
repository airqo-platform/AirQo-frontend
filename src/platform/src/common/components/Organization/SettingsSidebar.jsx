import React from 'react';
import { FaSave } from 'react-icons/fa';
import Button from '@/common/components/Button';
import CardWrapper from '@/common/components/CardWrapper';

const SettingsSidebar = ({
  onSave,
  saveStatus,
  organizationDetails,
  activeTab,
}) => {
  return (
    <CardWrapper>
      <div className="space-y-6">
        {' '}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FaSave className="mr-2 text-primary" />
          Actions
        </h3>
        <Button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          variant="filled"
          className="w-full flex items-center justify-center"
        >
          <FaSave className="mr-2 h-4 w-4" />
          {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
        </Button>
        {/* Organization Stats */}
        {organizationDetails && activeTab === 'organization' && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Organization Details
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    organizationDetails.grp_status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                  }`}
                >
                  {organizationDetails.grp_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Members:</span>
                <span>{organizationDetails.numberOfGroupUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>
                  {organizationDetails.createdAt
                    ? new Date(
                        organizationDetails.createdAt,
                      ).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}{' '}
        {/* Tips Section */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <h4 className="text-sm font-medium text-primary mb-2">
            💡{' '}
            {activeTab === 'organization'
              ? 'Organization Tips'
              : 'Appearance Tips'}
          </h4>
          {activeTab === 'organization' ? (
            <ul className="text-xs text-primary/80 space-y-1">
              <li>• Keep your organization name clear and professional</li>
              <li>• Use a high-quality logo for better branding</li>
              <li>• Ensure your website URL is accessible</li>
              <li>• Choose the correct timezone for your location</li>
            </ul>
          ) : (
            <ul className="text-xs text-primary/80 space-y-1">
              <li>• Choose themes that match your brand identity</li>
              <li>• Consider accessibility when selecting colors</li>
              <li>• Test appearance on different devices</li>
              <li>• Settings apply organization-wide</li>
            </ul>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

export default SettingsSidebar;
