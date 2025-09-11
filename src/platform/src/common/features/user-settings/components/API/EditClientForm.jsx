import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSelector, useDispatch } from 'react-redux';
import { AqUser02, AqPlus } from '@airqo/icons-react';
import { FiX, FiTrash2 } from 'react-icons/fi';

import ReusableDialog from '@/components/Modal/ReusableDialog';
import NotificationService from '@/core/utils/notificationService';
import InputField from '@/common/components/InputField';
import Button from '@/common/components/Button';
import { updateClientApi, getClientsApi } from '@/core/apis/Settings';
import { getUserDetails } from '@/core/apis/Account';
import { addClients, addClientsDetails } from '@/lib/store/services/apiClient';

const EditClientForm = ({ open, closeModal, data }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  const userInfo = useSelector((s) => s.login.userInfo);
  const userId = session?.user?.id || userInfo?.id || userInfo?._id;

  /* ----------- local state ----------- */
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState(['']);

  /* ----------- derive initial values once when dialog opens ----------- */
  const initial = useMemo(() => {
    if (!data) return { name: '', ipAddresses: [''] };

    const ips = Array.isArray(data.ip_addresses)
      ? data.ip_addresses
      : data.ip_addresses
        ? [data.ip_addresses]
        : [''];

    return { name: data.name || '', ipAddresses: ips };
  }, [data]);

  /* ----------- reset form whenever `data` changes ----------- */
  useEffect(() => {
    setClientName(initial.name);
    setIpAddresses(initial.ipAddresses);
  }, [initial]);

  /* ----------- helpers ----------- */
  const hasChanges = useMemo(() => {
    const currentFiltered = ipAddresses.map((ip) => ip.trim()).filter(Boolean);
    const initialFiltered = initial.ipAddresses
      .map((ip) => ip.trim())
      .filter(Boolean);

    return (
      clientName.trim() !== initial.name.trim() ||
      JSON.stringify(currentFiltered.sort()) !==
        JSON.stringify(initialFiltered.sort())
    );
  }, [clientName, ipAddresses, initial]);

  /* ----------- handlers ----------- */
  const addIp = () => setIpAddresses((prev) => [...prev, '']);

  const updateIp = (idx, value) =>
    setIpAddresses((prev) => prev.map((ip, i) => (i === idx ? value : ip)));

  const removeIp = (idx) =>
    setIpAddresses((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!clientName.trim()) {
      NotificationService.error(422, "Client name can't be empty");
      return;
    }
    if (!userId) {
      NotificationService.error(422, 'User ID is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: clientName.trim(),
        user_id: userId,
        ip_addresses: ipAddresses.map((ip) => ip.trim()).filter(Boolean),
      };

      const res = await updateClientApi(payload, data._id);

      // Normalize the updated client object from possible response shapes
      const updatedClient =
        (res && res.updated_client) ||
        (res && res.data && res.data.updated_client) ||
        (res && res.data && (res.data._id || res.data.id) ? res.data : null) ||
        (res && (res._id || res.id) ? res : null);

      // Determine success: prefer explicit `success: true`, or HTTP 2xx status, or presence of updated client id
      const isSuccess =
        (res && res.success === true) ||
        (typeof res?.status === 'number' &&
          res.status >= 200 &&
          res.status < 300) ||
        (updatedClient && (updatedClient._id || updatedClient.id));

      if (!isSuccess) {
        const msg =
          (res && (res.message || (res.data && res.data.message))) ||
          'Failed to update client';
        const statusCode = (res && res.status) || 400;
        NotificationService.error(statusCode, msg);
        setLoading(false);
        return;
      }

      const [userRes, clientsRes] = await Promise.all([
        getUserDetails(userId),
        getClientsApi(userId),
      ]);

      dispatch(addClients(userRes.users[0].clients));
      dispatch(addClientsDetails(clientsRes.clients));

      NotificationService.success(200, 'Client updated successfully');
      closeModal();
    } catch (e) {
      NotificationService.handleApiError(e, 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  /* ----------- render ----------- */
  return (
    <ReusableDialog
      isOpen={open}
      onClose={closeModal}
      title="Edit client"
      icon={AqUser02}
      showFooter
      primaryAction={{
        label: hasChanges ? 'Update Client' : 'No Changes',
        onClick: submit,
        disabled: loading || !clientName.trim() || !hasChanges,
        className:
          loading || !clientName.trim() || !hasChanges
            ? 'opacity-60 pointer-events-none'
            : '',
      }}
    >
      <div className="space-y-6">
        {/* ---- Client Name ---- */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <InputField
              type="text"
              placeholder="Enter a descriptive name for your client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            {clientName && (
              <button
                className="absolute inset-y-0 right-0 flex items-center mr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setClientName('')}
                aria-label="Clear client name"
                type="button"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This name will help you identify the client in your dashboard
          </p>
        </div>

        {/* ---- IP Addresses ---- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              IP Addresses
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Optional
            </span>
          </div>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {ipAddresses.map((ip, idx) => (
              <div key={idx} className="relative group">
                <InputField
                  type="text"
                  placeholder={`Enter IP address ${idx + 1}`}
                  value={ip}
                  onChange={(e) => updateIp(idx, e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center mr-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  onClick={() => removeIp(idx)}
                  aria-label={`Remove IP address ${idx + 1}`}
                  type="button"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={addIp}
            className="text-blue-600 border-dashed border-blue-300"
            Icon={AqPlus}
            showTextOnMobile
          >
            Add IP Address
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Restrict client access to specific IP addresses. Leave empty to
            allow access from any IP.
          </p>
        </div>

        {/* ---- Changes Summary ---- */}
        {hasChanges && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              Pending Changes
            </h4>
            <div className="space-y-1 text-sm">
              {clientName.trim() !== initial.name.trim() && (
                <p className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Name:</span> {initial.name} →{' '}
                  {clientName.trim()}
                </p>
              )}
              {JSON.stringify(
                ipAddresses.map((ip) => ip.trim()).filter(Boolean),
              ) !==
                JSON.stringify(
                  initial.ipAddresses.map((ip) => ip.trim()).filter(Boolean),
                ) && (
                <p className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">IP Addresses:</span> Modified
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---- Current Configuration ---- */}
        {clientName.trim() && !hasChanges && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              Current Configuration
            </h4>
            <div className="space-y-1 text-sm">
              <p className="text-green-800 dark:text-green-200">
                <span className="font-medium">Name:</span> {clientName.trim()}
              </p>
              <p className="text-green-800 dark:text-green-200">
                <span className="font-medium">IP Restrictions:</span>{' '}
                {ipAddresses.filter((ip) => ip.trim()).length ||
                  'None (unrestricted)'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ReusableDialog>
  );
};

export default React.memo(EditClientForm);
