import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSelector, useDispatch } from 'react-redux';
import ReusableDialog from '@/components/Modal/ReusableDialog';

import CustomToast from '@/common/components/Toast/CustomToast';
import { updateClientApi, getClientsApi } from '@/core/apis/Settings';
import { addClients, addClientsDetails } from '@/lib/store/services/apiClient';
import { getUserDetails } from '@/core/apis/Account';
import { AqUser02, AqPlus } from '@airqo/icons-react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import InputField from '@/common/components/InputField';

const EditClientForm = ({ open, closeModal, data }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const clientID = data?._id;
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState(['']);
  const [initialData, setInitialData] = useState(null);

  // Get user ID from session with fallback to Redux state
  const userId = session?.user?.id || userInfo?.id || userInfo?._id;

  useEffect(() => {
    handleInitialData();
  }, [data]);

  const handleInitialData = () => {
    const name = data?.name || '';
    const ipAddresses = Array.isArray(data?.ip_addresses)
      ? data?.ip_addresses
      : data?.ip_addresses
        ? [data?.ip_addresses]
        : [''];

    setClientName(name);
    setIpAddresses(ipAddresses);
    setInitialData({
      name,
      ipAddresses,
    });
  };

  const handleInputValueChange = useCallback((type, value, index) => {
    if (type === 'clientName') {
      setClientName(value);
    } else if (type === 'ipAddress') {
      setIpAddresses((prev) => {
        const newIpAddresses = [...prev];
        newIpAddresses[index] = value;
        return newIpAddresses;
      });
    }
  }, []);

  const handleRemoveInputValue = useCallback((type, index) => {
    if (type === 'clientName') {
      setClientName('');
    } else if (type === 'ipAddress') {
      setIpAddresses((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleAddIpAddress = useCallback(() => {
    setIpAddresses((prev) => [...prev, '']);
  }, []);

  // Check if form has changes
  const hasChanges = () => {
    if (!initialData) return false;

    const currentFilteredIps = ipAddresses.filter((ip) => ip.trim() !== '');
    const initialFilteredIps = initialData.ipAddresses.filter(
      (ip) => ip.trim() !== '',
    );

    return (
      clientName !== initialData.name ||
      currentFilteredIps.length !== initialFilteredIps.length ||
      !currentFilteredIps.every((ip, index) => ip === initialFilteredIps[index])
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!clientName) {
      CustomToast({ message: "Client name can't be empty", type: 'error' });
      setLoading(false);
      return;
    }

    if (!userId) {
      CustomToast({ message: 'User ID is required', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: clientName,
        user_id: userId,
      };

      const filteredIpAddresses = ipAddresses.filter((ip) => ip.trim() !== '');
      if (filteredIpAddresses.length > 0) {
        data.ip_addresses = filteredIpAddresses;
      }

      const response = await updateClientApi(data, clientID);
      if (response.success !== true) {
        throw new Error('Failed to update client');
      }
      const res = await getUserDetails(userId);
      const resp = await getClientsApi(userId);
      dispatch(addClients(res.users[0].clients));
      dispatch(addClientsDetails(resp.clients));
      CustomToast({ message: 'Client updated successfully', type: 'success' });
      closeModal();
    } catch (error) {
      CustomToast({
        message: error?.response?.data?.message || 'Failed to update client',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={closeModal}
      title="Edit client"
      icon={AqUser02}
      showFooter={true}
      primaryAction={{
        label: hasChanges() ? 'Update Client' : 'No Changes',
        onClick: handleSubmit,
        disabled: loading || !clientName.trim() || !hasChanges(),
        className:
          loading || !clientName.trim() || !hasChanges()
            ? 'opacity-60 pointer-events-none'
            : '',
      }}
    >
      {/* Form Content */}
      <div className="space-y-6">
        {/* Client Name Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <InputField
              type="text"
              label={null}
              placeholder="Enter a descriptive name for your client"
              value={clientName}
              onChange={(val) =>
                handleInputValueChange(
                  'clientName',
                  val.target ? val.target.value : val,
                )
              }
              className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {clientName && (
              <button
                className="absolute inset-y-0 right-0 flex justify-center items-center mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => handleRemoveInputValue('clientName')}
                tabIndex={-1}
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

        {/* IP Addresses Section */}
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
            {ipAddresses.map((ip, index) => (
              <div key={index} className="relative group">
                <InputField
                  type="text"
                  label={null}
                  placeholder={`Enter IP address ${index + 1} (e.g., 192.168.1.100)`}
                  value={ip}
                  onChange={(val) =>
                    handleInputValueChange(
                      'ipAddress',
                      val.target ? val.target.value : val,
                      index,
                    )
                  }
                  className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  className="absolute inset-y-0 right-0 flex justify-center items-center mr-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  onClick={() => handleRemoveInputValue('ipAddress', index)}
                  tabIndex={-1}
                  aria-label={`Remove IP address ${index + 1}`}
                  type="button"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add IP Button */}
          <button
            onClick={handleAddIpAddress}
            className="flex items-center justify-center w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <AqPlus size={16} className="mr-2" color="currentColor" />
            Add IP Address
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Restrict client access to specific IP addresses. Leave empty to
            allow access from any IP.
          </p>
        </div>

        {/* Changes Summary */}
        {hasChanges() && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              Pending Changes
            </h4>
            <div className="space-y-1 text-sm">
              {clientName !== initialData?.name && (
                <p className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Name:</span> {initialData?.name}{' '}
                  → {clientName}
                </p>
              )}
              {JSON.stringify(ipAddresses.filter((ip) => ip.trim())) !==
                JSON.stringify(
                  initialData?.ipAddresses?.filter((ip) => ip.trim()) || [],
                ) && (
                <p className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">IP Addresses:</span> Modified
                </p>
              )}
            </div>
          </div>
        )}

        {/* Current Configuration */}
        {clientName && !hasChanges() && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              Current Configuration
            </h4>
            <div className="space-y-1 text-sm">
              <p className="text-green-800 dark:text-green-200">
                <span className="font-medium">Name:</span> {clientName}
              </p>
              <p className="text-green-800 dark:text-green-200">
                <span className="font-medium">IP Restrictions:</span>{' '}
                {ipAddresses.filter((ip) => ip.trim()).length > 0
                  ? `${ipAddresses.filter((ip) => ip.trim()).length} address(es)`
                  : 'None (unrestricted)'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ReusableDialog>
  );
};

export default React.memo(EditClientForm);
