'use client';
import { useRef, useCallback } from 'react';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { useMapPageState } from '../hooks/useMapPageState';
import AirQoMap from '../components/AirQoMap';
import MapControls from '../components/MapControls';
import MapSidebar from '../components/map-sidebar';
import AirQualityLegend from '../components/Legend';
import Toast from '@/components/Toast';
import Loader from '@/components/Spinner';
import { LoadingOverlay } from '../hooks';
import { isDesktop } from '../utils/mapHelpers';
import { TOAST_CONFIG } from '../constants/mapConstants';

const MapPage = () => {
  const { width } = useWindowSize();
  const airqoMapRef = useRef(null);

  const {
    loading, // This is now the main loading state (map readings)
    setLoading, // Setter for main loading
    loadingOthers, // This is the loading state for WAQI data
    setLoadingOthers, // Setter for WAQI loading
    toastMessage,
    setToastMessage,
    clearToastMessage,
    isControlsExpanded,
    setIsControlsExpanded,
    siteDetails,
    pollutant,
    containerClassName,
    sidebarClassName,
    mapClassName,
    isMobile,
    showLegendAndControls,
  } = useMapPageState(width);

  // Map control actions
  const handleControlAction = useCallback(
    (action) => {
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
      if (isMobile) {
        setIsControlsExpanded(false);
      }
    },
    [isMobile, setIsControlsExpanded],
  );

  return (
    <div className={containerClassName}>
      <div className={`md:overflow-hidden md:rounded-l-xl ${sidebarClassName}`}>
        <MapSidebar siteDetails={siteDetails} isAdmin={true} />
      </div>
      <div className={mapClassName}>
        <div className="relative w-full h-full md:overflow-hidden md:rounded-r-xl">
          <AirQoMap
            ref={airqoMapRef}
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            customStyle="flex-grow h-full w-full relative dark:text-black-900"
            pollutant={pollutant}
            onToastMessage={setToastMessage}
            onMainLoadingChange={setLoading}
            onOthersLoadingChange={setLoadingOthers}
          />
          {/* Loading overlay for main data */}
          {loading && <LoadingOverlay />}
          {/* Legend */}
          {showLegendAndControls && (
            <div className="absolute left-4 bottom-2 z-50">
              <AirQualityLegend pollutant={pollutant} />
            </div>
          )}
          {/* Map controls */}
          <MapControls
            isDesktop={isDesktop(width)}
            isControlsExpanded={isControlsExpanded}
            setIsControlsExpanded={setIsControlsExpanded}
            onControlAction={handleControlAction}
            show={showLegendAndControls}
          />
          {/* Loading indicator for additional data (WAQI) */}
          {loadingOthers && (
            <div className="absolute bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md p-2 top-4 right-16 flex items-center z-50">
              <Loader size={14} />
              <span className="ml-2 text-sm">
                Loading global AQI data from 80+ cities...
              </span>
            </div>
          )}
          {/* Toast notifications */}
          {toastMessage.message && (
            <Toast
              message={toastMessage.message}
              clearData={clearToastMessage}
              type={toastMessage.type}
              timeout={TOAST_CONFIG.TIMEOUT}
              bgColor={toastMessage.bgColor}
              position={TOAST_CONFIG.POSITION}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
