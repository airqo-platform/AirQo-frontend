'use client';

import React, { useState, useCallback } from 'react';
import { Button, Dialog } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { useLeaveGroup, useUser } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { AqLogOut02, AqAlertTriangle } from '@airqo/icons-react';

const LeaveOrganizationCard: React.FC = () => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const { activeGroup } = useUser();
  const leaveGroup = useLeaveGroup();

  const isAirQoGroup =
    activeGroup?.title?.toLowerCase() === 'airqo' ||
    activeGroup?.organizationSlug?.toLowerCase() === 'airqo' ||
    !activeGroup?.organizationSlug;

  const handleLeaveClick = useCallback(() => {
    if (isAirQoGroup) {
      toast.error('You cannot leave the default AirQo organization');
      return;
    }
    setShowLeaveDialog(true);
  }, [isAirQoGroup]);

  const handleConfirmLeave = useCallback(async () => {
    if (!activeGroup?.id) {
      toast.error('No active organization found');
      return;
    }

    try {
      await leaveGroup.trigger({ groupId: activeGroup.id });
      toast.success(
        `You have successfully left ${activeGroup.title || 'the organization'}`
      );

      // Close dialog
      setShowLeaveDialog(false);

      // Reload the page to refresh all data and group memberships
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show the success toast
    } catch (error: unknown) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error(errorMessage);
      setShowLeaveDialog(false);
    }
  }, [activeGroup, leaveGroup]);

  // Don't render if it's the AirQo group
  if (isAirQoGroup) {
    return null;
  }

  return (
    <>
      {/* Leave Organization Card */}
      <div className="bg-white border border-amber-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Leave Organization
                </h3>
                <p className="text-sm text-gray-600">
                  Remove yourself from this organization
                </p>
              </div>
            </div>
            <Button
              variant="filled"
              onClick={handleLeaveClick}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 ring-red-600 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Leave Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Dialog */}
      <Dialog
        isOpen={showLeaveDialog}
        onClose={() => {
          if (!leaveGroup.isMutating) {
            setShowLeaveDialog(false);
          }
        }}
        title="Leave Organization"
        subtitle="This action cannot be undone"
        icon={AqAlertTriangle}
        iconColor="text-amber-600"
        iconBgColor="bg-amber-100"
        primaryAction={{
          label: leaveGroup.isMutating ? 'Leaving...' : 'Leave Organization',
          onClick: handleConfirmLeave,
          loading: leaveGroup.isMutating,
          className:
            'bg-amber-600 hover:bg-amber-700 ring-amber-600 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 text-white',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setShowLeaveDialog(false),
          disabled: leaveGroup.isMutating,
        }}
        preventBackdropClose={leaveGroup.isMutating}
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
              <AqLogOut02 className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to leave{' '}
              <span className="font-semibold text-foreground">
                {activeGroup?.title || 'this organization'}
              </span>
              ?
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 font-medium">
              <strong>Note:</strong> You will lose access to all organization
              resources, data, and settings. This action cannot be undone.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default LeaveOrganizationCard;
