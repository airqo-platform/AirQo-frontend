import { useCallback, useRef } from 'react';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import {
  CustomZoomControl,
  CustomGeolocateControl,
  GlobeControl,
} from './index';
import { isDesktop, safeExecute } from '../utils/mapHelpers';

/**
 * Hook for managing map controls
 */
export const useMapControls = (mapRef, onToastMessage) => {
  const controlsAddedRef = useRef(false);
  const { width } = useWindowSize();

  const addControls = useCallback(() => {
    const map = mapRef.current;
    if (!map || !isDesktop(width)) return;

    // Remove existing controls to avoid duplicates
    const existingControls = map._controls || [];
    [...existingControls].forEach((ctrl) => {
      if (
        ctrl instanceof GlobeControl ||
        ctrl instanceof CustomZoomControl ||
        ctrl instanceof CustomGeolocateControl
      ) {
        map.removeControl(ctrl);
      }
    });

    // Add controls with error handling
    safeExecute(() => {
      map.addControl(new GlobeControl(), 'bottom-right');
      map.addControl(new CustomZoomControl(), 'bottom-right');
      map.addControl(
        new CustomGeolocateControl(onToastMessage),
        'bottom-right',
      );
      controlsAddedRef.current = true;
    });
  }, [mapRef, onToastMessage, width]);

  const ensureControls = useCallback(() => {
    if (!controlsAddedRef.current && mapRef.current?.loaded()) {
      addControls();
    }
  }, [addControls, mapRef]);

  const resetControlsState = useCallback(() => {
    controlsAddedRef.current = false;
  }, []);

  return {
    addControls,
    ensureControls,
    resetControlsState,
    controlsAddedRef,
  };
};
