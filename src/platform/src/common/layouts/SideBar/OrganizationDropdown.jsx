import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { GoOrganization } from 'react-icons/go';
import CustomDropdown from '@/common/components/Button/CustomDropdown';
import Spinner from '@/common/components/Spinner';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import clsx from 'clsx';
import { Transition } from '@headlessui/react';

const cleanGroupName = (name) => {
  if (!name) return '';
  return name.replace(/[-_]/g, ' ').toUpperCase();
};

const OrganizationDropdown = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || theme === 'system';
  const buttonRef = useRef(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const {
    id: activeGroupId,
    title: activeGroupTitle,
    groupList,
    userID,
    loading: isFetchingActiveGroup,
  } = useGetActiveGroup();
  const isCollapsed = useSelector((state) => state?.sidebar?.isCollapsed);

  // Track button position for fixed position dropdown
  useEffect(() => {
    const updateButtonPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.top,
          left: rect.left + rect.width,
        });
      }
    };

    // Update position initially, on resize, and when dropdown opens
    updateButtonPosition();
    window.addEventListener('resize', updateButtonPosition);
    window.addEventListener('scroll', updateButtonPosition);

    return () => {
      window.removeEventListener('resize', updateButtonPosition);
      window.removeEventListener('scroll', updateButtonPosition);
    };
  }, [isCollapsed, isOpen]);
  useEffect(() => {
    if (isFetchingActiveGroup) return;

    // Set organization name in Redux when active group changes
    if (activeGroupTitle) {
      dispatch(setOrganizationName(activeGroupTitle));
    }
  }, [isFetchingActiveGroup, activeGroupTitle, dispatch]);

  const handleUpdatePreferences = useCallback(
    async (group) => {
      if (!group?._id) return;

      setLoading(true);
      setSelectedGroupId(group._id);

      try {
        // Check if this is an organization-specific context
        const currentPath = window.location.pathname;
        const isOrgContext = currentPath.startsWith('/org/');

        if (isOrgContext) {
          // In organization context, we don't update preferences
          // Instead, we redirect to the selected organization's dashboard
          const orgSlug =
            group.orgSlug ||
            group.grp_title?.toLowerCase().replace(/\s+/g, '-');
          if (orgSlug && orgSlug !== currentPath.split('/')[2]) {
            window.location.href = `/org/${orgSlug}/dashboard`;
            return;
          }
        } else {
          // In individual user context, update preferences as usual
          await dispatch(
            replaceUserPreferences({
              user_id: userID,
              group_id: group._id,
            }),
          );

          // Update session with new active group if possible
          if (updateSession) {
            await updateSession({
              ...session,
              user: {
                ...session?.user,
                activeGroup: group,
              },
            });
          }
        }
      } catch (error) {
        // Silent error handling for production stability
        // Error details are available in development console
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Failed to update organization/group selection:', error);
        }
      } finally {
        setLoading(false);
        setSelectedGroupId(null);
        setIsOpen(false);
      }
    },
    [dispatch, userID, updateSession, session],
  );
  const handleDropdownSelect = (group) => {
    if (group?._id !== activeGroupId) {
      dispatch(setOrganizationName(group.grp_title));
      handleUpdatePreferences(group);
    } else {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen || !isCollapsed) return;

    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        !event.target.closest('.org-dropdown-menu')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isCollapsed]);

  if (!activeGroupId || groupList.length === 0) {
    return null;
  }

  // Generate the organization icon component
  const orgIcon = (
    <div
      className={clsx(
        'w-7 h-7 flex items-center justify-center rounded-full',
        isDarkMode ? 'bg-primary/20' : 'bg-primary/10',
      )}
    >
      <GoOrganization className="text-primary text-lg" />
    </div>
  );

  // Handle button click for collapsed state
  const handleButtonClick = () => {
    if (isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  // Render fixed position dropdown for collapsed state with a transition
  const renderFixedDropdown = () => {
    if (!isCollapsed) return null;

    return (
      <Transition
        show={isOpen}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <div
          className={clsx(
            'fixed z-50 org-dropdown-menu',
            'p-2 rounded-xl shadow-lg border',
            'w-64 max-h-[260px] overflow-y-auto custom-scrollbar',
            isDarkMode
              ? 'bg-[#1d1f20] border-gray-700 scrollbar-thumb-gray-600 scrollbar-track-gray-800'
              : 'bg-white border-gray-200 scrollbar-thumb-gray-300 scrollbar-track-gray-100',
          )}
          style={{
            top: '5rem',
            left: buttonPosition.left + 20,
          }}
        >
          {groupList.length > 0 ? (
            groupList.map((group) => (
              <div
                key={group?._id}
                className={clsx(
                  'p-1 rounded-lg mb-1',
                  activeGroupId === group._id
                    ? isDarkMode
                      ? 'bg-primary/10'
                      : 'bg-primary/5'
                    : '',
                )}
              >
                <button
                  onClick={() => handleDropdownSelect(group)}
                  className={clsx(
                    'w-full h-11 px-3 rounded-lg py-2 flex items-center justify-between',
                    isDarkMode ? 'text-white' : 'text-gray-800',
                    activeGroupId === group._id
                      ? isDarkMode
                        ? 'text-primary'
                        : 'text-primary'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100',
                  )}
                  disabled={loading && selectedGroupId === group._id}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={clsx(
                        'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full',
                        isDarkMode ? 'bg-primary/20' : 'bg-primary/10',
                      )}
                    >
                      <GoOrganization className="text-primary text-lg" />
                    </div>
                    <div
                      className="text-sm font-medium truncate"
                      title={cleanGroupName(group.grp_title)}
                    >
                      {cleanGroupName(group.grp_title)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {loading && selectedGroupId === group._id ? (
                      <Spinner width={16} height={16} />
                    ) : activeGroupId === group._id ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-primary"
                      >
                        <circle cx="12" cy="12" r="8" fill="currentColor" />
                        <circle
                          cx="12"
                          cy="12"
                          r="11"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    ) : (
                      <div
                        className={clsx(
                          'w-4 h-4 rounded-full border',
                          isDarkMode ? 'border-gray-500' : 'border-gray-400',
                        )}
                      ></div>
                    )}
                  </div>
                </button>
              </div>
            ))
          ) : (
            <div
              className={clsx(
                'p-3 text-center',
                isDarkMode ? 'text-white' : 'text-gray-800',
              )}
            >
              No groups available
            </div>
          )}
        </div>
      </Transition>
    );
  };

  return (
    <div className={clsx('relative mt-4', className)} ref={buttonRef}>
      <CustomDropdown
        icon={orgIcon}
        disableMobileCollapse
        text={
          <div className="max-w-[100px] truncate">
            {cleanGroupName(activeGroupTitle)}
          </div>
        }
        onClick={handleButtonClick}
        isButton={isCollapsed}
        className="w-full"
        buttonClassName={clsx(
          'w-full border rounded-xl',
          isDarkMode
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-200 text-gray-800',
          'hover:bg-opacity-90',
        )}
        menuClassName={clsx(
          'max-h-[260px] overflow-y-auto relative -left-1 custom-scrollbar',
          isDarkMode
            ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800 bg-gray-800'
            : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
        )}
        isCollapsed={isCollapsed}
        hideArrow={groupList.length <= 1}
      >
        {groupList.length > 0 ? (
          groupList.map((group) => (
            <div
              key={group?._id}
              className={clsx(
                'p-1 rounded-lg mb-1',
                activeGroupId === group._id
                  ? isDarkMode
                    ? 'bg-primary/10'
                    : 'bg-primary/5'
                  : '',
              )}
            >
              <button
                onClick={() => handleDropdownSelect(group)}
                className={clsx(
                  'w-full h-11 px-3 rounded-lg py-2 flex items-center justify-between',
                  isDarkMode ? 'text-white' : 'text-gray-800',
                  activeGroupId === group._id
                    ? isDarkMode
                      ? 'text-primary'
                      : 'text-primary'
                    : isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100',
                )}
                disabled={loading && selectedGroupId === group._id}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={clsx(
                      'w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full',
                      isDarkMode ? 'bg-primary/20' : 'bg-primary/10',
                    )}
                  >
                    <GoOrganization className="text-primary text-lg" />
                  </div>
                  <div
                    className="text-sm font-medium truncate"
                    title={cleanGroupName(group.grp_title)}
                  >
                    {cleanGroupName(group.grp_title)}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {loading && selectedGroupId === group._id ? (
                    <Spinner width={16} height={16} />
                  ) : activeGroupId === group._id ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="8" fill="currentColor" />
                      <circle
                        cx="12"
                        cy="12"
                        r="11"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <div
                      className={clsx(
                        'w-4 h-4 rounded-full border',
                        isDarkMode ? 'border-gray-500' : 'border-gray-400',
                      )}
                    ></div>
                  )}
                </div>
              </button>
            </div>
          ))
        ) : (
          <div
            className={clsx(
              'p-3 text-center',
              isDarkMode ? 'text-white' : 'text-gray-800',
            )}
          >
            No groups available
          </div>
        )}
      </CustomDropdown>

      {/* Render fixed position dropdown when collapsed with smooth transition */}
      {renderFixedDropdown()}
    </div>
  );
};

export default React.memo(OrganizationDropdown);
