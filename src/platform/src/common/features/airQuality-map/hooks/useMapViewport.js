import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCenter, setZoom } from '@/lib/store/services/map/MapSlice';
import {
  parseUrlParams,
  shouldUpdateViewport,
  getInitialZoom,
} from '../utils/mapHelpers';

/**
 * Hook for managing map viewport (center, zoom)
 */
export const useMapViewport = () => {
  const dispatch = useDispatch();
  const mapData = useSelector((state) => state.map);
  const { zoom: reduxZoom, center: reduxCenter } = mapData;

  const urlParams = useMemo(() => parseUrlParams(), []);

  const initialCenter = useMemo(
    () => shouldUpdateViewport(urlParams, reduxCenter, reduxZoom),
    [urlParams, reduxCenter, reduxZoom],
  );

  const initialZoom = useMemo(
    () => getInitialZoom(urlParams, reduxZoom),
    [urlParams, reduxZoom],
  );

  // Sync URL params to Redux
  useEffect(() => {
    if (urlParams.valid) {
      dispatch(
        setCenter({
          latitude: urlParams.lat,
          longitude: urlParams.lng,
        }),
      );
      dispatch(setZoom(urlParams.zm));
    }
  }, [dispatch, urlParams]);

  return {
    initialCenter,
    initialZoom,
    reduxCenter,
    reduxZoom,
    urlParams,
  };
};
