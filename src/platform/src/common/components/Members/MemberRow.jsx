import Button from '@/common/components/Button';
import { FaEllipsisV } from 'react-icons/fa';
import {
  AqMail01,
  AqTrash03,
  AqUserX02,
  AqUserCheck02,
} from '@airqo/icons-react';

const MemberRow = ({
  member,
  groupDetails,
  showActionMenu,
  setShowActionMenu,
  formatLastActive,
}) => {
  const getStatusBadge = (member) => {
    const status = member.isActive ? 'active' : 'inactive';
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };

    const icons = {
      active: <AqUserCheck02 className="w-3 h-3" />,
      inactive: <AqUserX02 className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[status] || colors.inactive
        }`}
      >
        {icons[status]}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  return (
    <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {member.firstName?.charAt(0) || ''}
                {member.lastName?.charAt(0) || ''}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Login Count: {member.loginCount || 0}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white flex items-center">
          <AqMail01 className="w-4 h-4 text-gray-400 mr-2" />
          {member.email}
        </div>
        {member.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {member.description}
          </div>
        )}{' '}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(member)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatLastActive(member)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative action-menu-container">
          <Button
            variant="text"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() =>
              setShowActionMenu(
                showActionMenu === member._id ? null : member._id,
              )
            }
          >
            <FaEllipsisV className="w-4 h-4" />
          </Button>

          {showActionMenu === member._id && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                {groupDetails?.grp_manager?._id !== member._id && (
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      // TODO: Implement remove user functionality
                      alert('Remove user functionality will be implemented');
                      setShowActionMenu(null);
                    }}
                  >
                    <AqTrash03 className="w-4 h-4 mr-2" />
                    Remove from group
                  </button>
                )}
                {groupDetails?.grp_manager?._id === member._id && (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Group Manager
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default MemberRow;
