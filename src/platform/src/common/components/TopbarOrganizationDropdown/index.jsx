import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { isEmpty } from 'underscore';
import { IoChevronDown } from 'react-icons/io5';
import { Menu, Transition } from '@headlessui/react';

// Hooks
import { useOutsideClick } from '@/core/hooks';

// Redux
import {
  selectActiveGroup,
  selectUserGroups,
  selectUserGroupsLoading,
  setActiveGroup,
  fetchUserGroups,
} from '@/lib/store/services/groups';

// Utils
import { removeSpacesAndLowerCase } from '@/core/utils/strings';
import { ORGANIZATION_LABEL } from '@/lib/constants';

/**
 * Utility function to validate ObjectId format
 * Prevents API calls with invalid ObjectIds
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Dropdown component for selecting organization/group in topbar
 * Handles both individual user flows and organization flows
 */
const TopbarOrganizationDropdown = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const pathname = usePathname();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);
  const isLoadingGroups = useSelector(selectUserGroupsLoading);
  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Handle outside click to close dropdown
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);
  // Determine if we're in organization context
  const isOrganizationContext = useMemo(() => {
    return (
      pathname?.includes('/organization/') ||
      pathname?.startsWith('/organization')
    );
  }, [pathname]);

  // Get organization slug from URL if in organization context
  const organizationSlug = useMemo(() => {
    if (!isOrganizationContext || !pathname) return null;
    const match = pathname.match(/\/organization\/([^/]+)/);
    return match ? match[1] : null;
  }, [isOrganizationContext, pathname]);

  // Effect to fetch user groups when component mounts or user changes
  useEffect(() => {
    const userID = session?.user?.id;
    // Only fetch if we have a valid user ID and no groups loaded yet
    if (
      userID &&
      isValidObjectId(userID) &&
      isEmpty(userGroups) &&
      !isLoadingGroups
    ) {
      dispatch(fetchUserGroups(userID));
    }
  }, [session?.user?.id, userGroups, isLoadingGroups, dispatch]);

  // Effect to set default active group based on context
  useEffect(() => {
    if (isEmpty(userGroups) || !session?.user?.id) return;

    if (isOrganizationContext && organizationSlug) {
      // In organization context: find group by slug
      const orgGroup = userGroups.find(
        (group) =>
          removeSpacesAndLowerCase(group.grp_title) ===
          organizationSlug.toLowerCase(),
      );

      if (orgGroup && (!activeGroup || activeGroup._id !== orgGroup._id)) {
        dispatch(setActiveGroup(orgGroup));
      }
    } else if (!isOrganizationContext) {
      // In individual context: set AirQo as default
      const airqoGroup = userGroups.find(
        (group) => removeSpacesAndLowerCase(group.grp_title) === 'airqo',
      );

      if (airqoGroup && (!activeGroup || activeGroup._id !== airqoGroup._id)) {
        dispatch(setActiveGroup(airqoGroup));
      }
    }
  }, [
    userGroups,
    activeGroup,
    isOrganizationContext,
    organizationSlug,
    session?.user?.id,
    dispatch,
  ]);

  /**
   * Handle group selection
   */
  const handleGroupSelect = (group) => {
    if (group._id !== activeGroup?._id) {
      dispatch(setActiveGroup(group));
    }
    setIsOpen(false);
  };

  // Don't render anything if no groups or loading
  if (isLoadingGroups || isEmpty(userGroups)) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
      </div>
    );
  }

  // Don't render if no active group
  if (!activeGroup) {
    return null;
  }
  return (
    <Menu as="div" className="relative" ref={dropdownRef}>
      <Menu.Button
        className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Organization/Group Logo */}
        {activeGroup.grp_image ? (
          <img
            src={activeGroup.grp_image}
            alt={`${activeGroup.grp_title} logo`}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
            {activeGroup.grp_title?.charAt(0)?.toUpperCase() || 'O'}
          </div>
        )}

        {/* Organization/Group Name */}
        <span className="max-w-32 truncate">
          {activeGroup.grp_title || ORGANIZATION_LABEL}
        </span>

        {/* Dropdown Arrow */}
        <IoChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Menu.Button>

      <Transition
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          static
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Switch Organization
          </div>

          <div className="max-h-60 overflow-y-auto">
            {userGroups.map((group) => (
              <Menu.Item key={group._id}>
                {({ active }) => (
                  <button
                    onClick={() => handleGroupSelect(group)}
                    className={`flex w-full items-center space-x-3 px-3 py-2 text-left text-sm ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } ${
                      activeGroup._id === group._id
                        ? 'bg-blue-100 font-medium text-blue-800'
                        : ''
                    }`}
                  >
                    {/* Group Logo */}
                    {group.grp_image ? (
                      <img
                        src={group.grp_image}
                        alt={`${group.grp_title} logo`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        {group.grp_title?.charAt(0)?.toUpperCase() || 'O'}
                      </div>
                    )}

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">
                        {group.grp_title || 'Unnamed Organization'}
                      </div>
                      {group.grp_website && (
                        <div className="truncate text-xs text-gray-500">
                          {group.grp_website}
                        </div>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {activeGroup._id === group._id && (
                      <div className="flex h-2 w-2 rounded-full bg-blue-600"></div>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>

          {/* Footer */}
          {userGroups.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              No organizations available
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default TopbarOrganizationDropdown;
