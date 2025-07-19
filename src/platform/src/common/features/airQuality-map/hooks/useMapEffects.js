// ===================================================================
// features/airQuality-map/hooks/useMapEffects.js - New utility hook
// ===================================================================

import { useEffect } from 'react';

/**
 * Hook for managing map-related side effects
 */
export const useMapEffects = ({
  mapRef,
  mapInitializedRef,
  addControls,
  ensureControls,
  controlsAddedRef,
}) => {
  // Periodically check and ensure controls are added
  useEffect(() => {
    if (!mapInitializedRef.current || !mapRef.current) return;

    const checkControls = () => {
      if (!controlsAddedRef.current && mapRef.current?.loaded()) {
        addControls();
      }
    };

    checkControls();
    const interval = setInterval(checkControls, 2000);
    return () => clearInterval(interval);
  }, [addControls, controlsAddedRef, mapInitializedRef, mapRef]);

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && mapInitializedRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapRef, mapInitializedRef]);

  // Ensure controls on map idle
  useEffect(() => {
    if (!mapRef.current || !mapInitializedRef.current) return;

    const map = mapRef.current;
    const handleIdle = () => ensureControls();

    map.on('idle', handleIdle);
    return () => map.off('idle', handleIdle);
  }, [mapRef, mapInitializedRef, ensureControls]);
};
