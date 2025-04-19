import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const GroupLogo = ({ className = '', style = {}, width = 40, height = 40 }) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { id: activeGroupId, loading: isFetchingActiveGroup } =
    useGetActiveGroup();

  // Theme hook
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  useEffect(() => {
    if (activeGroupId) {
      setLoadError(false);
      setIsLoading(true);
      dispatch(fetchGroupInfo(activeGroupId));
    }
  }, [activeGroupId, dispatch]);

  // Grab both the profile state and the loading flag for the slice
  const { groupInfo: orgInfo, loading: isProfileLoading } = useSelector(
    (s) => s.groupInfo,
  );

  console.log(orgInfo);

  const profilePic = orgInfo?.grp_profile_picture;
  const title = orgInfo?.grp_title;

  // Reset error state when profile picture changes
  useEffect(() => {
    if (profilePic) {
      setLoadError(false);
      setIsLoading(true);
    }
  }, [profilePic]);

  const handleImgError = () => {
    setLoadError(true);
    setIsLoading(false);
  };

  const handleImgLoad = () => {
    setIsLoading(false);
  };

  // Determine dimensions
  const imgWidth = style.width || width;
  const imgHeight = style.height || height;

  // Loading skeleton
  if (isFetchingActiveGroup || isProfileLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
        style={{
          width: imgWidth,
          height: imgHeight,
          ...style,
        }}
      />
    );
  }

  // If we have a profile picture URL and haven't encountered an error
  if (profilePic && !loadError) {
    return (
      <div className="relative" style={{ width: imgWidth, height: imgHeight }}>
        {isLoading && (
          <div
            className={`absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
            style={{
              width: imgWidth,
              height: imgHeight,
            }}
          />
        )}
        <img
          key={profilePic}
          src={profilePic}
          alt={title ? `${title} logo` : 'Group logo'}
          onError={handleImgError}
          onLoad={handleImgLoad}
          className={`${className} ${isLoading ? 'invisible' : 'visible'} w-full h-full object-contain`}
          style={{
            ...style,
            width: imgWidth,
            height: imgHeight,
          }}
        />
      </div>
    );
  }

  // Fallback to AirqoLogo
  return (
    <div style={{ width: imgWidth, height: imgHeight }}>
      <AirqoLogo
        key={isDarkMode ? 'dark' : 'light'}
        className={className}
        fill={isDarkMode ? '#FFFFFF' : undefined}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default GroupLogo;
