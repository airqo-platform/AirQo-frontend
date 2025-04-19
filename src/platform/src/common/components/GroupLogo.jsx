import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const GroupLogo = ({ className, style, width, height }) => {
  const dispatch = useDispatch();
  const { id: activeGroupId, loading: fetchingGroup } = useGetActiveGroup();
  const { groupInfo: orgInfo, loading: fetchingProfile } = useSelector(
    (s) => s.groupInfo,
  );

  const profilePic = orgInfo?.grp_image;
  const title = orgInfo?.grp_title || 'Group logo';

  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // fetch / refetch
  useEffect(() => {
    if (activeGroupId) {
      setImgLoading(true);
      setImgError(false);
      dispatch(fetchGroupInfo(activeGroupId));
    }
  }, [activeGroupId, dispatch]);

  // theme
  const { theme, systemTheme } = useTheme();
  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const wrapperStyle = {
    position: 'relative',
    width,
    height,
    ...style,
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    visibility: imgLoading ? 'hidden' : 'visible',
  };

  // loading skeleton
  if (fetchingGroup || fetchingProfile) {
    return (
      <div
        className={`${className} animate-pulse bg-gray-200 dark:bg-gray-700 rounded`}
        style={wrapperStyle}
      />
    );
  }

  // show fetched image
  if (profilePic && !imgError) {
    return (
      <div className={className} style={wrapperStyle}>
        {imgLoading && (
          <div
            className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
            style={{ width: '100%', height: '100%' }}
          />
        )}
        <img
          src={profilePic}
          alt={title}
          onLoad={() => setImgLoading(false)}
          onError={() => {
            setImgError(true);
            setImgLoading(false);
          }}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          style={imgStyle}
        />
      </div>
    );
  }

  // fallback SVG
  return (
    <div className={className} style={wrapperStyle}>
      <AirqoLogo fill={isDarkMode ? '#FFFFFF' : undefined} />
    </div>
  );
};

GroupLogo.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

GroupLogo.defaultProps = {
  className: '',
  style: {},
  width: 40,
  height: 40,
};

export default GroupLogo;
