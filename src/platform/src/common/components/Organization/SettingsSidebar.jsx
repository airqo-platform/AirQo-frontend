import {
  AqSave01,
  AqEdit05,
  AqRefreshCcw01,
  AqLoading02,
} from '@airqo/icons-react';
import { format } from 'date-fns';
import Button from '@/common/components/Button';
import CardWrapper from '@/common/components/CardWrapper';

const SettingsSidebar = ({
  onSave,
  saveStatus,
  organizationDetails,
  activeTab,
  isAppearanceUpdating = false,
  hasUnsavedChanges = false,
  onReset,
  // Domain-specific props
  domainFormRef,
}) => {
  // Determine if the save button should be disabled and what text to show
  const isSaving =
    saveStatus === 'saving' ||
    (activeTab === 'appearance' && isAppearanceUpdating);
  const isDomainUpdating = domainFormRef?.current?.isUpdating;

  return (
    <CardWrapper>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <AqSave01 className="mr-2 text-primary" />
          Actions
        </h3>
        {/* Action Buttons Section */}
        <div className="flex flex-col gap-3 w-full">
          {/* Save button - hide for domain tab as it handles its own save operations */}
          {activeTab !== 'domain' && (
            <Button
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              variant="filled"
              Icon={!isSaving ? AqLoading02 : AqSave01}
              className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary/25 ${isSaving ? 'bg-primary/40 text-primary/70 cursor-wait' : 'bg-primary hover:bg-primary/90 text-white'}`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
          {/* Domain tab info and update button */}
          {activeTab === 'domain' && (
            <Button
              onClick={() => {
                if (domainFormRef?.current?.handleUpdate) {
                  domainFormRef.current.handleUpdate();
                }
              }}
              disabled={isDomainUpdating || !hasUnsavedChanges}
              variant="filled"
              Icon={isDomainUpdating ? AqLoading02 : AqEdit05}
              className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary/25 ${isDomainUpdating ? 'bg-primary/40 text-primary/70 cursor-wait' : 'bg-primary hover:bg-primary/90 text-white'}`}
            >
              {isDomainUpdating ? 'Updating URL...' : 'Update URL'}
            </Button>
          )}
          {/* Discard changes button - only show for organization tab and when there are unsaved changes */}
          {hasUnsavedChanges &&
            onReset &&
            (activeTab === 'organization' || activeTab === 'domain') &&
            !isSaving && (
              <Button
                onClick={onReset}
                variant="outlined"
                className="w-full py-3 px-4 flex items-center justify-center rounded-lg font-semibold transition-all duration-200 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <AqRefreshCcw01 className="mr-2 h-4 w-4" />
                Discard Changes
              </Button>
            )}
        </div>
        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && !isSaving && (
          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-sm text-amber-800 dark:text-amber-200">
                You have unsaved changes
              </span>
            </div>
          </div>
        )}
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
              </div>{' '}
              <div className="flex justify-between">
                <span>Created:</span>
                <span>
                  {organizationDetails.createdAt
                    ? format(
                        new Date(organizationDetails.createdAt),
                        'MMM dd, yyyy',
                      )
                    : 'N/A'}
                </span>
              </div>
            </div>{' '}
          </div>
        )}
        {/* Theme Override Notice - Only for Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Theme Priority Notice
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  Individual user theme preferences will override organization
                  settings. Users can reset to organization defaults through the
                  theme customizer by clicking the gear icon (⚙️) located at the
                  right edge of the screen.
                </p>
              </div>
            </div>
          </div>
        )}{' '}
        {/* Tips Section - Only for organization and appearance tabs */}
        {activeTab !== 'domain' && (
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
        )}
      </div>
    </CardWrapper>
  );
};

export default SettingsSidebar;
