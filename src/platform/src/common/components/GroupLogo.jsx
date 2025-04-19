import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

const STORAGE_KEY_PREFIX = 'groupLogoUrl';

const GroupLogo = ({ className, style, width, height }) => {
  const dispatch = useDispatch();
  const { id: activeGroupId, loading: fetchingGroup } = useGetActiveGroup();
  const { groupInfo: orgInfo, loading: fetchingProfile } = useSelector(
    (s) => s.groupInfo,
  );

  const profilePic = orgInfo?.grp_image;
  const title = orgInfo?.grp_title || 'Group logo';

  const [persistedLogo, setPersistedLogo] = useState(null);
  const [displaySrc, setDisplaySrc] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);

    if (activeGroupId) {
      try {
        const saved = localStorage.getItem(
          `${STORAGE_KEY_PREFIX}_${activeGroupId}`,
        );
        setPersistedLogo(saved);
      } catch {
        // silent
      }

      dispatch(fetchGroupInfo(activeGroupId))
        .unwrap()
        .catch(() => setImgError(true));
    } else {
      setPersistedLogo(null);
    }
  }, [activeGroupId, dispatch]);

  useEffect(() => {
    if (profilePic) {
      setDisplaySrc(profilePic);
    } else {
      setDisplaySrc(persistedLogo);
    }
  }, [profilePic, persistedLogo]);

  useEffect(() => {
    if (displaySrc) {
      setIsImageLoading(true);
      setImgError(false);
    }
  }, [displaySrc]);

  useEffect(() => {
    if (profilePic && activeGroupId) {
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}_${activeGroupId}`,
          profilePic,
        );
        setPersistedLogo(profilePic);
      } catch {
        // silent
      }
    }
  }, [profilePic, activeGroupId]);

  const handleLoadComplete = () => setIsImageLoading(false);

  const handleLoadError = () => {
    setImgError(true);
    setIsImageLoading(false);
    if (activeGroupId) {
      try {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${activeGroupId}`);
      } catch {
        // silent
      }
    }
    setPersistedLogo(null);
  };

  const isDataLoading = fetchingGroup || fetchingProfile;

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

  // if orgInfo loaded without grp_image and no persisted logo, show default
  if (
    orgInfo &&
    !Object.prototype.hasOwnProperty.call(orgInfo, 'grp_image') &&
    !persistedLogo
  ) {
    return (
      <div className={className} style={wrapperStyle}>
        <AirqoLogo width={width || defaultW} height={height || defaultH} />
      </div>
    );
  }

  // skeleton when loading and no cached logo
  if (isDataLoading && !persistedLogo) {
    return (
      <div
        className={`${className} animate-pulse bg-gray-200 rounded`}
        style={wrapperStyle}
      />
    );
  }

  // show fetched or cached image
  if (displaySrc && !imgError) {
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
            onLoadingComplete={handleLoadComplete}
            onError={handleLoadError}
          />
        </div>
      </div>
    );
  }

  // fallback default logo
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
