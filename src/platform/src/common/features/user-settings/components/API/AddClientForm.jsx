import { useSession } from 'next-auth/react';
import { AqUser02, AqPlus } from '@airqo/icons-react';
import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReusableDialog from '@/components/Modal/ReusableDialog';
import NotificationService from '@/core/utils/notificationService';
import { createClientApi } from '@/core/apis/Settings';
import { addClients, performRefresh } from '@/lib/store/services/apiClient';
import { getUserDetails } from '@/core/apis/Account';
import { FiX, FiTrash2 } from 'react-icons/fi';
import Button from '@/common/components/Button';
import InputField from '@/common/components/InputField';

/* ---------- tiny helper ---------- */
const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

const isValidIp = (ip) => !ip || IPV4_REGEX.test(ip.trim());

/* ---------- component ---------- */
const AddClientForm = ({ open, closeModal }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);

  const userId = useMemo(
    () => session?.user?.id || userInfo?.id || userInfo?._id,
    [session, userInfo],
  );

  /* ---------- local state ---------- */
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState(['']);

  /* ---------- validators ---------- */
  const ipErrors = useMemo(
    () => ipAddresses.map((ip) => !isValidIp(ip)),
    [ipAddresses],
  );

  const hasAnyIpError = ipErrors.some(Boolean);

  /* ---------- handlers ---------- */
  const handleChangeName = useCallback((eOrValue) => {
    const value =
      typeof eOrValue === 'string' ? eOrValue : (eOrValue?.target?.value ?? '');
    setClientName(value);
  }, []);

  const handleChangeIp = useCallback((idx, eOrValue) => {
    const value =
      typeof eOrValue === 'string' ? eOrValue : (eOrValue?.target?.value ?? '');
    setIpAddresses((prev) => prev.map((ip, i) => (i === idx ? value : ip)));
  }, []);

  const handleRemoveIp = useCallback((idx) => {
    setIpAddresses((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAddIp = useCallback(() => {
    setIpAddresses((prev) => [...prev, '']);
  }, []);

  const handleClearName = useCallback(() => setClientName(''), []);

  /* ---------- submit ---------- */
  const handleSubmit = useCallback(async () => {
    if (!clientName.trim()) {
      return NotificationService.error(422, "Client name can't be empty");
    }
    if (!userId) {
      return NotificationService.error(422, 'User ID is required');
    }
    if (hasAnyIpError) {
      return NotificationService.error(422, 'Please fix invalid IP addresses');
    }

    setLoading(true);

    const payload = {
      name: clientName.trim(),
      user_id: userId,
      ip_addresses: ipAddresses.map((ip) => ip.trim()).filter(Boolean), // drop empty
    };

    try {
      const res = await createClientApi(payload);

      /* ------- success / failure ------- */
      const success =
        res?.success === true || !!(res?.created_client || res?.id || res?._id);

      if (success) {
        /* refresh user details */
        const userRes = await getUserDetails(userId);
        if (userRes?.success && userRes.users?.[0]?.clients) {
          dispatch(addClients(userRes.users[0].clients));
        }
        NotificationService.success(status, 'Client created successfully');
        dispatch(performRefresh());
        closeModal();
      } else {
        /* business error from backend */
        NotificationService.error(
          status,
          res?.message || 'Client creation failed',
        );
      }
    } catch (err) {
      /* network / runtime error */
      NotificationService.handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [clientName, userId, ipAddresses, hasAnyIpError, dispatch, closeModal]);

  /* ---------- render ---------- */
  return (
    <ReusableDialog
      isOpen={open}
      onClose={closeModal}
      title="Create new client"
      icon={AqUser02}
      showFooter
      primaryAction={{
        label: loading ? 'Creating…' : 'Create Client',
        onClick: handleSubmit,
        disabled: loading || !clientName.trim() || hasAnyIpError,
      }}
    >
      <div className="space-y-4">
        {/* ----- client name ----- */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <InputField
              type="text"
              placeholder="Enter a descriptive name for your client"
              value={clientName}
              onChange={handleChangeName}
            />
            {clientName && (
              <button
                aria-label="Clear client name"
                className="absolute inset-y-0 right-0 flex items-center mr-3 text-gray-400 hover:text-gray-600"
                onClick={handleClearName}
                type="button"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ----- ip addresses ----- */}
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
            {ipAddresses.map((ip, idx) => (
              <div key={idx} className="relative">
                <InputField
                  type="text"
                  placeholder={
                    idx === 0
                      ? 'Enter IP address (e.g., 192.168.1.100)'
                      : `Enter IP address ${idx + 1}`
                  }
                  value={ip}
                  onChange={(eOrValue) => handleChangeIp(idx, eOrValue)}
                  className={
                    ipErrors[idx]
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-blue-500'
                  }
                />
                {ipAddresses.length > 1 && (
                  <button
                    aria-label={`Remove IP address ${idx + 1}`}
                    className="absolute inset-y-0 right-0 flex items-center mr-3 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemoveIp(idx)}
                    type="button"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleAddIp}
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

        {/* ----- summary ----- */}
        {clientName && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Client Summary
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Name:</span> {clientName}
              </p>
              <p>
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
