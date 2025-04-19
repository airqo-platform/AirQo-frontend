import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

const GroupLogo = ({ className, style, width, height }) => {
  const dispatch = useDispatch();
  const { id: activeGroupId, loading: fetchingGroup } = useGetActiveGroup();
  const { groupInfo: orgInfo, loading: fetchingProfile } = useSelector(
    (s) => s.groupInfo,
  );

  const profilePic = orgInfo?.grp_image;
  const title = orgInfo?.grp_title || 'Group logo';

  // loading + error flags
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // on group change: reset state & fetch
  useEffect(() => {
    setIsLoading(true);
    setImgError(false);

    if (activeGroupId) {
      dispatch(fetchGroupInfo(activeGroupId))
        .unwrap()
        .catch(() => {
          // if fetching fails, stop loading & trigger fallback
          setImgError(true);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [activeGroupId, dispatch]);

  const handleLoadComplete = () => setIsLoading(false);
  const handleLoadError = () => {
    setImgError(true);
    setIsLoading(false);
  };

  // sizing
  const defaultW = 80,
    defaultH = 80;
  const wrapperStyle = {
    position: 'relative',
    width: width || defaultW,
    height: height || defaultH,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  // show skeleton *only* when there's an image to load
  const showSkeleton =
    !!profilePic && (fetchingGroup || fetchingProfile || isLoading);

  return (
    <div className={className} style={wrapperStyle}>
      {/*
        Pulse skeleton on top of the image container while loading
      */}
      {showSkeleton && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gray-200 rounded" />
      )}

      {/*
        If we have a valid picture URL and no error, render it.
        Otherwise, fallback to the AirqoLogo SVG.
      */}
      {profilePic && !imgError ? (
        <div className="relative w-full h-full z-0">
          <Image
            src={profilePic}
            alt={title}
            fill
            sizes={`${typeof width === 'number' ? width : defaultW}px`}
            quality={90}
            priority
            className="object-contain  mix-blend-multiply"
            onLoadingComplete={handleLoadComplete}
            onError={handleLoadError}
          />
        </div>
      ) : (
        <AirqoLogo width={width || defaultW} height={height || defaultH} />
      )}
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
