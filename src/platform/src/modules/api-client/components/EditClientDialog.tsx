'use client';

import React, { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Button, Input, Dialog, Checkbox } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { isValidIpAddress } from '@/shared/lib/validators';
import { clientService } from '@/shared/services/clientService';
import type { Client } from '@/shared/types/api';
import { trackEvent } from '@/shared/utils/analytics';
import { trackApiClientAction } from '@/shared/utils/enhancedAnalytics';
import { AqCopy06, AqEye, AqEyeOff } from '@airqo/icons-react';

interface SecretDisplayProps {
  secret: string;
}

const SecretDisplay: React.FC<SecretDisplayProps> = ({ secret }) => {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const maskedSecret = secret
    ? secret.length > 4
      ? `••••••••${secret.slice(-4)}`
      : '••••••••'
    : '—';

  const displayedSecret = isRevealed ? secret : maskedSecret;

  const handleCopy = async () => {
    if (!secret) {
      toast.error('Client secret is unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(secret);
      toast.success('Client secret copied to clipboard');
    } catch {
      toast.error('Failed to copy client secret');
    }
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 w-full">
          <code className="flex-1 min-w-0 truncate rounded-md border border-border bg-background px-2 py-1 font-mono text-sm text-foreground">
            {displayedSecret}
          </code>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsRevealed(previous => !previous)}
            className="h-8 w-8 flex-shrink-0 p-0"
            aria-label={
              isRevealed ? 'Hide client secret' : 'Show client secret'
            }
            disabled={!secret}
          >
            {isRevealed ? (
              <AqEyeOff className="h-4 w-4" />
            ) : (
              <AqEye className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8 flex-shrink-0 p-0"
            aria-label="Copy client secret"
            disabled={!secret}
          >
            <AqCopy06 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Share this only with services that need to send the X-Client-Secret
          header.
        </p>
      </div>
    </div>
  );
};

interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSuccess?: () => void;
}

const EditClientDialog: React.FC<EditClientDialogProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess,
}) => {
  const posthog = usePostHog();
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState<string[]>(['']);
  const [ipErrors, setIpErrors] = useState<string[]>(['']);
  const [requireSecret, setRequireSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setClientName(client.name);
      setRequireSecret(Boolean(client.requireClientSecret));
      const ips =
        client.ip_addresses && Array.isArray(client.ip_addresses)
          ? client.ip_addresses
          : [];
      setIpAddresses(ips.length > 0 ? ips : ['']);
      setIpErrors(ips.length > 0 ? ips.map(() => '') : ['']);
    }
  }, [isOpen, client]);

  const handleAddIpAddress = () => {
    setIpAddresses([...ipAddresses, '']);
    setIpErrors([...ipErrors, '']);
  };

  const handleRemoveIpAddress = (index: number) => {
    if (ipAddresses.length > 1) {
      setIpAddresses(ipAddresses.filter((_, i) => i !== index));
      setIpErrors(ipErrors.filter((_, i) => i !== index));
    }
  };

  const handleIpAddressChange = (index: number, value: string) => {
    const newIpAddresses = [...ipAddresses];
    newIpAddresses[index] = value;
    setIpAddresses(newIpAddresses);

    // Clear error when user starts typing
    const newIpErrors = [...ipErrors];
    newIpErrors[index] = '';
    setIpErrors(newIpErrors);
  };

  const handleSubmit = async () => {
    if (!client) {
      toast.error('Client data is missing');
      return;
    }
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const filteredIpAddresses = ipAddresses.filter(ip => ip.trim() !== '');

      // Validate IP addresses
      const newIpErrors = [...ipErrors];
      let hasErrors = false;
      for (let i = 0; i < ipAddresses.length; i++) {
        const ip = ipAddresses[i].trim();
        if (ip && !isValidIpAddress(ip)) {
          newIpErrors[i] = 'Invalid IP address format';
          hasErrors = true;
        } else {
          newIpErrors[i] = '';
        }
      }
      setIpErrors(newIpErrors);

      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }

      const clientData = {
        name: clientName.trim(),
        require_secret: requireSecret,
        ...(filteredIpAddresses.length > 0 && {
          ip_addresses: filteredIpAddresses,
        }),
      };

      await clientService.updateClient(client._id, clientData);
      trackApiClientAction(posthog, 'update', {
        client_id: client._id,
        client_name_length: clientName.trim().length,
        ip_count: filteredIpAddresses.length,
      });
      trackEvent('api_client_updated', {
        client_id: client._id,
        ip_count: filteredIpAddresses.length,
      });
      toast.success('Client updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Client update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit API Client"
      maxHeight="max-h-[75vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: 'Update',
        onClick: handleSubmit,
        disabled: isSubmitting || !clientName.trim(),
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isSubmitting,
        variant: 'outlined',
        loading: isSubmitting,
      }}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Name *
          </label>
          <Input
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Enter a descriptive name for your client"
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose a name that helps you identify this client later
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IP Addresses (Optional)
          </label>
          <div className="space-y-2">
            {ipAddresses.map((ip, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    value={ip}
                    onChange={e => handleIpAddressChange(index, e.target.value)}
                    placeholder="192.168.1.1"
                    className="w-full"
                  />
                  {ipErrors[index] && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {ipErrors[index]}
                    </p>
                  )}
                </div>
                {ipAddresses.length > 1 && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => handleRemoveIpAddress(index)}
                    className="px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddIpAddress}
              className="w-full"
            >
              + Add IP Address
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Restrict access to specific IP addresses (leave empty for no
            restrictions)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={requireSecret}
              onCheckedChange={setRequireSecret}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Require client secret on every request
              </p>
              <p className="text-xs text-muted-foreground">
                When enabled, API requests using this client&apos;s token must
                also send the client secret via the X-Client-Secret header.
              </p>
            </div>
          </div>

          {requireSecret && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Client secret
                </p>
                <p className="text-xs text-muted-foreground">
                  Use this value with the X-Client-Secret header.
                </p>
              </div>

              <SecretDisplay secret={client?.client_secret || ''} />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default EditClientDialog;
