import { useSession } from 'next-auth/react';
import { AqUser02, AqPlus } from '@airqo/icons-react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReusableDialog from '@/components/Modal/ReusableDialog';
import CustomToast from '@/common/components/Toast/CustomToast';
import { createClientApi } from '@/core/apis/Settings';
import { addClients, performRefresh } from '@/lib/store/services/apiClient';
import { getUserDetails } from '@/core/apis/Account';
import { FiX, FiTrash2 } from 'react-icons/fi';
import InputField from '@/common/components/InputField';

const AddClientForm = ({ open, closeModal }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState(['']);
  const userInfo = useSelector((state) => state.login.userInfo);

  // Get user ID from session with fallback to Redux state
  const userId = session?.user?.id || userInfo?.id || userInfo?._id;

  const handleInputValueChange = (type, value, index) => {
    if (type === 'clientName') {
      setClientName(value);
    } else if (type === 'ipAddress') {
      const newIpAddresses = [...ipAddresses];
      newIpAddresses[index] = value;
      setIpAddresses(newIpAddresses);
    }
  };

  const handleRemoveInputValue = (type, index) => {
    if (type === 'clientName') {
      setClientName('');
    } else if (type === 'ipAddress') {
      const newIpAddresses = ipAddresses.filter((_, i) => i !== index);
      setIpAddresses(newIpAddresses);
    }
  };

  const handleAddIpAddress = () => {
    setIpAddresses([...ipAddresses, '']);
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

      const response = await createClientApi(data);

      if (response.success === true) {
        const res = await getUserDetails(userId);

        if (res.success === true) {
          dispatch(addClients(res.users[0].clients));
        }
        CustomToast({
          message: 'Client created successfully',
          type: 'success',
        });
      }
      dispatch(performRefresh());
      closeModal();
    } catch (error) {
      CustomToast({
        message: error?.response?.data?.message || 'Failed to create client',
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
      title="Create new client"
      icon={AqUser02}
      showFooter={true}
      primaryAction={{
        label: 'Create Client',
        onClick: handleSubmit,
        disabled: loading || !clientName.trim(),
        className:
          loading || !clientName.trim() ? 'opacity-60 pointer-events-none' : '',
      }}
    >
      {/* Form Content */}
      <div className="space-y-4">
        {/* Client Name Section */}
        <div className="space-y-1">
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
        </div>

        {/* IP Addresses Section */}
        <div className="space-y-2">
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
                  placeholder={
                    index === 0
                      ? 'Enter IP address (e.g., 192.168.1.100)'
                      : `Enter IP address ${index + 1}`
                  }
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
                {ipAddresses.length > 1 && (
                  <button
                    className="absolute inset-y-0 right-0 flex justify-center items-center mr-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    onClick={() => handleRemoveInputValue('ipAddress', index)}
                    tabIndex={-1}
                    aria-label={`Remove IP address ${index + 1}`}
                    type="button"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
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

        {/* Form Summary */}
        {clientName && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Client Summary
            </h4>
            <div className="space-y-1 text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                <span className="font-medium">Name:</span> {clientName}
              </p>
              <p className="text-blue-800 dark:text-blue-200">
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

export default AddClientForm;
