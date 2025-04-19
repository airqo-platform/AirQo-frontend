import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

const STORAGE_KEY_PREFIX = 'groupLogoUrl';

const GroupLogo = ({ className, style, width, height }) => {
  // Hooks
  const dispatch = useDispatch();
  const { id: activeGroupId, loading: fetchingGroup } = useGetActiveGroup();
  const { groupInfo: orgInfo, loading: fetchingProfile } = useSelector(
    (state) => state.groupInfo,
  );

  const [persistedLogo, setPersistedLogo] = useState(null);
  const [displaySrc, setDisplaySrc] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Effect: clear cache & fetch group info
  useEffect(() => {
    setImgError(false);
    setPersistedLogo(null);
    setDisplaySrc(null);

    try {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith(STORAGE_KEY_PREFIX) &&
          key !== `${STORAGE_KEY_PREFIX}_${activeGroupId}`
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // empty for now
    }

    if (activeGroupId) {
      // Load cached logo
      try {
        const saved = localStorage.getItem(
          `${STORAGE_KEY_PREFIX}_${activeGroupId}`,
        );
        if (saved) {
          setPersistedLogo(saved);
          setDisplaySrc(saved);
        }
      } catch {
        // empty for now
      }

      dispatch(fetchGroupInfo(activeGroupId))
        .unwrap()
        .catch(() => setImgError(true));
    }
  }, [activeGroupId, dispatch]);

  // Effect: update displaySrc when orgInfo or persistedLogo changes
  useEffect(() => {
    const pic = orgInfo?.grp_image || null;
    if (pic) {
      setDisplaySrc(pic);
    } else if (!displaySrc) {
      setDisplaySrc(persistedLogo);
    }
  }, [orgInfo, persistedLogo]);

  // Effect: set loading state when displaySrc changes
  useEffect(() => {
    if (displaySrc) {
      setIsImageLoading(true);
      setImgError(false);
    }
  }, [displaySrc]);

  // Effect: cache new logo
  useEffect(() => {
    const pic = orgInfo?.grp_image;
    if (pic && activeGroupId) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}_${activeGroupId}`, pic);
        setPersistedLogo(pic);
      } catch {
        // empty for now
      }
    }
  }, [orgInfo, activeGroupId]);

  // Pure JS logic
  const profilePic = orgInfo?.grp_image || null;
  const title = orgInfo?.grp_title || 'Group logo';
  const isAirqoGroup = title.trim().toLowerCase() === 'airqo';

  const defaultW = 80;
  const defaultH = 80;
  const wrapperStyle = {
    position: 'relative',
    width: width || defaultW,
    height: height || defaultH,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const isDataLoading = fetchingGroup || fetchingProfile;

  // Render logic
  if (isAirqoGroup) {
    return (
      <div className={className} style={wrapperStyle}>
        <AirqoLogo width={width || defaultW} height={height || defaultH} />
      </div>
    );
  }

  if ((!profilePic && !persistedLogo) || imgError) {
    return (
      <div className={className} style={wrapperStyle}>
        <AirqoLogo width={width || defaultW} height={height || defaultH} />
      </div>
    );
  }

  if (isDataLoading && !persistedLogo) {
    return (
      <div
        className={`${className} animate-pulse bg-gray-200 rounded`}
        style={wrapperStyle}
      />
    );
  }

  if (displaySrc) {
    return (
      <div className={className} style={wrapperStyle}>
        {isImageLoading && (
          <div className="absolute inset-0 z-10 animate-pulse bg-gray-200 rounded" />
        )}
        <div className="relative w-full h-full">
          <Image
            src={displaySrc}
            alt={title}
            fill
            sizes={`${typeof width === 'number' ? width : defaultW}px`}
            quality={90}
            priority
            className="object-contain"
            onLoadingComplete={() => setIsImageLoading(false)}
            onError={() => {
              setImgError(true);
              setIsImageLoading(false);
              try {
                localStorage.removeItem(
                  `${STORAGE_KEY_PREFIX}_${activeGroupId}`,
                );
                setPersistedLogo(null);
              } catch {
                // empty for now
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={wrapperStyle}>
      <AirqoLogo width={width || defaultW} height={height || defaultH} />
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
};

export default GroupLogo;
