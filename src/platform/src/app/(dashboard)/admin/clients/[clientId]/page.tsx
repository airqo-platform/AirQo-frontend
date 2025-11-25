'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  PageHeading,
  LoadingSpinner,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { formatDate } from '@/shared/utils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  AqArrowLeft,
  AqEdit05,
  AqTrash01,
  AqRefreshCw05,
  AqCopy06,
  AqShieldTick,
  AqShield01,
} from '@airqo/icons-react';
import { clientService } from '@/shared/services/clientService';
import useSWR from 'swr';
import Dialog from '@/shared/components/ui/dialog';
import EditClientDialog from '@/modules/api-client/components/EditClientDialog';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { useRBAC, useUser } from '@/shared/hooks';

const ClientDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { hasAnyPermission } = useRBAC();
  const { user } = useUser();
  const clientId = params?.clientId as string;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshSecretDialogOpen, setRefreshSecretDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshingSecret, setIsRefreshingSecret] = useState(false);
  const [showFullSecret, setShowFullSecret] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);

  // Fetch client details
  const {
    data: clientResponse,
    isLoading,
    error,
    mutate,
  } = useSWR(clientId ? `/api/clients/${clientId}` : null, () =>
    clientService.getClientById(clientId)
  );

  const client = clientResponse?.clients?.[0];

  const handleBack = () => {
    router.push('/admin/clients');
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
      await clientService.deleteClient(clientId);
      toast.success('Client deleted successfully');
      router.push('/admin/clients');
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Delete client error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshSecret = async () => {
    if (!hasAnyPermission(['TOKEN_MANAGE', 'TOKEN_GENERATE'])) {
      toast.error('You do not have permission to manage tokens');
      return;
    }

    setIsRefreshingSecret(true);
    try {
      await clientService.refreshClientSecret(clientId);
      toast.success('Client secret refreshed successfully');
      setRefreshSecretDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Refresh secret error:', error);
    } finally {
      setIsRefreshingSecret(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading client details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          Icon={AqArrowLeft}
          iconPosition="start"
        >
          Back to Clients
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            {error ? 'Failed to load client details' : 'Client not found'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredRoles={['AIRQO_SUPER_ADMIN']}
      customCheck={() => !!user?.email?.toLowerCase().endsWith('@airqo.net')}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need super admin privileges and a valid AirQo email to access API client details."
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={handleBack}
            Icon={AqArrowLeft}
            iconPosition="start"
          >
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <PageHeading
            title={client.name}
            subtitle={`Client ID: ${client._id}`}
          />
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => setEditDialogOpen(true)}
              Icon={AqEdit05}
              iconPosition="start"
            >
              Edit
            </Button>
            {hasAnyPermission(['TOKEN_MANAGE', 'TOKEN_GENERATE']) && (
              <Button
                variant="outlined"
                onClick={() => setRefreshSecretDialogOpen(true)}
                Icon={AqRefreshCw05}
                iconPosition="start"
              >
                Refresh Secret
              </Button>
            )}
            <Button
              variant="filled"
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
              Icon={AqTrash01}
              iconPosition="start"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Client Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            {client.isActive ? (
              <AqShieldTick className="w-8 h-8 text-green-600" />
            ) : (
              <AqShield01 className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {client.isActive ? 'Active Client' : 'Inactive Client'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {client.isActive
                  ? 'This client is currently active and can generate tokens'
                  : 'This client is inactive and cannot generate new tokens'}
              </p>
            </div>
          </div>
        </Card>

        {/* Client Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Client Name
                </label>
                <p className="mt-1 text-base font-medium">{client.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Client ID
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {client._id}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(client._id, 'Client ID')}
                    Icon={AqCopy06}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      client.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* User Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            {client.user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </label>
                  <p className="mt-1 text-base font-medium">
                    {client.user.firstName} {client.user.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="mt-1 text-base">{client.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Phone Number
                  </label>
                  <p className="mt-1 text-base">
                    {client.user.phoneNumber || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Login Count
                  </label>
                  <p className="mt-1 text-base">
                    {client.user.loginCount || 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No user information available</p>
            )}
          </Card>
        </div>

        {/* Client Secret */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Client Secret</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono break-all">
                {showFullSecret
                  ? client.client_secret
                  : `${client.client_secret.slice(0, 20)}...${client.client_secret.slice(-20)}`}
              </code>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => setShowFullSecret(!showFullSecret)}
              >
                {showFullSecret ? 'Hide' : 'Show'}
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() =>
                  copyToClipboard(client.client_secret, 'Client secret')
                }
                Icon={AqCopy06}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keep this secret secure. Do not share it publicly.
            </p>
          </div>
        </Card>

        {/* IP Addresses */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            IP Address Restrictions
          </h3>
          {client.ip_addresses && client.ip_addresses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {client.ip_addresses.map((ip, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-mono"
                >
                  {ip}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No IP restrictions configured</p>
          )}
        </Card>

        {/* Access Token */}
        {client.access_token && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Access Token</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Token
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono break-all">
                    {showFullToken
                      ? client.access_token.token
                      : `${client.access_token.token.slice(0, 8)}...${client.access_token.token.slice(-8)}`}
                  </code>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => setShowFullToken(!showFullToken)}
                  >
                    {showFullToken ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() =>
                      copyToClipboard(
                        client.access_token!.token,
                        'Access token'
                      )
                    }
                    Icon={AqCopy06}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Token Name
                  </label>
                  <p className="mt-1 text-base">{client.access_token.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created At
                  </label>
                  <p className="mt-1 text-base">
                    {formatDate(client.access_token.createdAt, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Expires At
                  </label>
                  <p className="mt-1 text-base">
                    {formatDate(client.access_token.expires, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Edit Dialog */}
        <EditClientDialog
          isOpen={editDialogOpen}
          client={client}
          onClose={() => setEditDialogOpen(false)}
          onSuccess={() => {
            setEditDialogOpen(false);
            mutate();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete Client"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the client{' '}
              <span className="font-semibold">{client.name}</span>? This action
              cannot be undone and will invalidate all associated tokens.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Client'}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Refresh Secret Confirmation Dialog */}
        <Dialog
          isOpen={refreshSecretDialogOpen}
          onClose={() => setRefreshSecretDialogOpen(false)}
          title="Refresh Client Secret"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to refresh the client secret for{' '}
              <span className="font-semibold">{client.name}</span>? The old
              secret will be invalidated and a new one will be generated.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() => setRefreshSecretDialogOpen(false)}
                disabled={isRefreshingSecret}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={handleRefreshSecret}
                disabled={isRefreshingSecret}
              >
                {isRefreshingSecret ? 'Refreshing...' : 'Refresh Secret'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default ClientDetailsPage;
