import { useState } from 'react';
import PropTypes from 'prop-types';

// Dummy permissions data
const ALL_PERMISSIONS = [
  { id: 'view_users', label: 'View Users' },
  { id: 'edit_users', label: 'Edit Users' },
  { id: 'delete_users', label: 'Delete Users' },
  { id: 'view_devices', label: 'View Devices' },
  { id: 'edit_devices', label: 'Edit Devices' },
  { id: 'delete_devices', label: 'Delete Devices' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'export_data', label: 'Export Data' },
];

const PermissionSelector = ({
  initialSelected = [],
  onChange,
  loading = false,
}) => {
  const [selected, setSelected] = useState(initialSelected);

  const handleToggle = (permId) => {
    let updated;
    if (selected.includes(permId)) {
      updated = selected.filter((id) => id !== permId);
    } else {
      updated = [...selected, permId];
    }
    setSelected(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ALL_PERMISSIONS.map((perm) => (
          <label
            key={perm.id}
            className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition-colors
              ${
                selected.includes(perm.id)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }
              ${loading ? 'opacity-60 pointer-events-none' : ''}
            `}
          >
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600 mr-3"
              checked={selected.includes(perm.id)}
              onChange={() => handleToggle(perm.id)}
              disabled={loading}
            />
            {perm.label}
          </label>
        ))}
      </div>
      <div className="text-sm text-gray-500">
        {selected.length} permission{selected.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
};

PermissionSelector.propTypes = {
  initialSelected: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  loading: PropTypes.bool,
};

export default PermissionSelector;
