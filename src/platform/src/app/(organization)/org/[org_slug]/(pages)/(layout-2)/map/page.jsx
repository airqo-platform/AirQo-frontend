'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/features/airQuality-map';
import Sidebar from '@/features/airQuality-map/components/sidebar';
import AirQualityLegend from '@/features/airQuality-map/components/Legend';
import Toast from '@/components/Toast';
import Loader from '@/components/Spinner';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { IconButton, LoadingOverlay } from '@/features/airQuality-map/hooks';
import withOrgAuth from '@/core/HOC/withOrgAuth';

// Icons
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import CameraIcon from '@/icons/map/cameraIcon';
import DotsVerticalIcon from '@/icons/map/dotsVerticalIcon';

const OrganizationMapPage = () => {
  const dispatch = useDispatch();
  const airqoMapRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [pollutant] = useState('pm2_5');

  const siteDetails = useSelector((state) => state.grids.gridsData);
  const { width } = useWindowSize();

  useEffect(() => {
    dispatch(getGridsDataSummary());
  }, [dispatch]);
  // Generate suggested sites for organization context
  useEffect(() => {
    if (siteDetails && siteDetails.length > 0) {
      const uniqueSites = siteDetails.filter(
        (site, index, self) =>
          index === self.findIndex((s) => s._id === site._id),
      );
      const selectedSites = uniqueSites
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      dispatch(addSuggestedSites(selectedSites));
    }
  }, [siteDetails, dispatch]);

  // Close mobile controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isControlsExpanded && !event.target.closest('.controls-container')) {
        setIsControlsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isControlsExpanded]);

  // Responsive layout classes based on screen size
  const isMobile = width < 1024;

  // Mobile layout: Map (40% height) on top, Sidebar (60% height) at bottom
  // Desktop layout: Sidebar on left, Map on right (full height for both)
  const containerClassName = isMobile
    ? 'flex flex-col w-full h-dvh overflow-hidden'
    : 'flex flex-row w-full h-dvh pt-2 pr-2 pb-2 pl-0 overflow-hidden';

  const sidebarClassName = isMobile
    ? 'transition-all duration-500 ease-in-out h-[60%] w-full sidebar-scroll-bar order-2'
    : 'transition-all duration-300 h-full min-w-[380px] lg:w-[470px]';

  const mapClassName = isMobile
    ? 'transition-all duration-500 ease-in-out h-[40%] w-full order-1'
    : 'transition-all duration-300 h-full w-full';

  // Map control actions
  const handleControlAction = (action) => {
    if (!airqoMapRef.current) return;
    switch (action) {
      case 'refresh':
        airqoMapRef.current.refreshMap();
        break;
      case 'share':
        airqoMapRef.current.shareLocation();
        break;
      case 'capture':
        airqoMapRef.current.captureScreenshot();
        break;
      case 'layers':
        airqoMapRef.current.openLayerModal();
        break;
      default:
        break;
    }
    if (isMobile) setIsControlsExpanded(false);
  };
  return (
    <>
      <div className={containerClassName}>
        <div className={sidebarClassName}>
          <Sidebar siteDetails={siteDetails} isAdmin={true}>
            {/* Organization-specific sidebar content */}
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 mb-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Organization Data
              </h3>
              <p className="text-xs text-blue-600">
                Viewing air quality data for your organization&apos;s monitoring
                network
              </p>
            </div>
          </Sidebar>
        </div>
        <div className={mapClassName}>
          <div className="relative w-full h-full">
            <AirQoMap
              ref={airqoMapRef}
              mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              customStyle="flex-grow h-full w-full relative dark:text-black-900"
              pollutant={pollutant}
              onToastMessage={setToastMessage}
              onLoadingChange={setLoading}
              onLoadingOthersChange={setLoadingOthers}
            />
            {loading && (
              <LoadingOverlay size={70}>
                <Loader width={32} height={32} />
              </LoadingOverlay>
            )}
            {/* Show legend only when appropriate */}
            {(width >= 1024 || !siteDetails?.selectedNode) && (
              <div className="absolute left-4 bottom-2 z-[1000]">
                <AirQualityLegend pollutant={pollutant} />
              </div>
            )}
            {/* Map controls */}
            {(width >= 1024 || !siteDetails?.selectedNode) && (
              <div
                className="absolute top-4 right-0 controls-container"
                style={{
                  right: '16px',
                  zIndex: 10000,
                }}
              >
                {width >= 1024 ? (
                  <div className="flex flex-col gap-4">
                    <IconButton
                      onClick={() => handleControlAction('refresh')}
                      title="Refresh Map"
                      icon={<RefreshIcon />}
                    />
                    <IconButton
                      onClick={() => handleControlAction('share')}
                      title="Share Location"
                      icon={<ShareIcon />}
                    />
                    <IconButton
                      onClick={() => handleControlAction('capture')}
                      title="Capture Screenshot"
                      icon={<CameraIcon />}
                    />
                    <IconButton
                      onClick={() => handleControlAction('layers')}
                      title="Map Layers"
                      icon={<LayerIcon />}
                    />
                  </div>
                ) : (
                  <div className="relative controls-container">
                    <div className="flex items-center">
                      {isControlsExpanded && (
                        <div
                          className={`
                            absolute right-full mr-2 flex gap-2 z-[2000]
                            transform transition-all duration-200 ease-in-out
                            ${isControlsExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                          `}
                        >
                          <IconButton
                            onClick={() => handleControlAction('refresh')}
                            title="Refresh Map"
                            icon={<RefreshIcon />}
                          />
                          <IconButton
                            onClick={() => handleControlAction('share')}
                            title="Share Location"
                            icon={<ShareIcon />}
                          />
                          <IconButton
                            onClick={() => handleControlAction('capture')}
                            title="Capture Screenshot"
                            icon={<CameraIcon />}
                          />
                        </div>
                      )}
                      <IconButton
                        onClick={() =>
                          setIsControlsExpanded(!isControlsExpanded)
                        }
                        title="Map Controls"
                        icon={<DotsVerticalIcon />}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {loadingOthers && (
              <div className="absolute bg-white dark:text-black-900 rounded-md p-2 top-4 right-16 flex items-center z-50">
                <Loader width={16} height={16} />
                <span className="ml-2 text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {toastMessage && (
        <Toast
          type="success"
          timeout={3000}
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  );
};

export default withOrgAuth(OrganizationMapPage);
