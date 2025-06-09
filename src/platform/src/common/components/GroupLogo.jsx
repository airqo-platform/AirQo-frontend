import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

const STORAGE_KEY = 'groupLogoUrl';
const LOGO_REFRESH_EVENT = 'logoRefresh';

const GroupLogo = ({ className = '', style = {} }) => {
  const dispatch = useDispatch();
  const { id: activeGroupId, loading: fetchingGroup } = useGetActiveGroup();
  const { groupInfo: orgInfo, loading: fetchingProfile } = useSelector(
    (state) => state.groupInfo,
  );

  const [displaySrc, setDisplaySrc] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prevIdRef = useRef(null);
  // Listen for logo refresh events from settings page
  useEffect(() => {
    const handleLogoRefresh = () => {
      // Clear cache and force refresh
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      setDisplaySrc(null);
      setHasError(false);

      if (activeGroupId) {
        dispatch(fetchGroupInfo(activeGroupId));
      }
    };

    window.addEventListener(LOGO_REFRESH_EVENT, handleLogoRefresh);
    return () =>
      window.removeEventListener(LOGO_REFRESH_EVENT, handleLogoRefresh);
  }, [activeGroupId, dispatch]);

  // Fetch only when groupId truly changes
  useEffect(() => {
    if (!activeGroupId || prevIdRef.current === activeGroupId) return;

    // clear cached logo
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      //empty
    }

    setHasError(false);
    setDisplaySrc(null);

    dispatch(fetchGroupInfo(activeGroupId))
      .unwrap()
      .catch(() => setHasError(true));

    prevIdRef.current = activeGroupId;
  }, [activeGroupId, dispatch]);

  // Cache new logo when received
  useEffect(() => {
    const pic = orgInfo?.grp_image;
    if (pic) {
      setDisplaySrc(pic);
      try {
        localStorage.setItem(STORAGE_KEY, pic);
      } catch {
        //empty
      }
    }
  }, [orgInfo]);

  // Trigger skeleton overlay while image loads
  useEffect(() => {
    if (displaySrc) {
      setIsLoadingImage(true);
      setHasError(false);
    }
  }, [displaySrc]);

  const isFetching = fetchingGroup || fetchingProfile;
  const containerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const renderSkeleton = () => (
    <div
      className={`${className} animate-pulse bg-gray-200 rounded`}
      style={containerStyle}
    />
  );

  const renderFallback = () => (
    <div className={className} style={containerStyle}>
      <AirqoLogo />
    </div>
  );

  if (!activeGroupId || hasError) return renderFallback();
  if (isFetching && !displaySrc) return renderSkeleton();

  if (displaySrc) {
    return (
      <div className={className} style={containerStyle}>
        {isLoadingImage && renderSkeleton()}
        <div style={{ position: 'relative', width: '50px', height: '50px' }}>
          <Image
            key={displaySrc}
            src={displaySrc}
            alt={orgInfo?.grp_title || 'Group logo'}
            fill
            onLoadingComplete={() => setIsLoadingImage(false)}
            onError={() => {
              setHasError(true);
              setIsLoadingImage(false);
            }}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    );
  }

  return renderFallback();
};

GroupLogo.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};

export default GroupLogo;
