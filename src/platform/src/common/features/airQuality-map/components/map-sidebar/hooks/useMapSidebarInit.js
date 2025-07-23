import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setOpenLocationDetails,
  setSelectedLocation,
} from '@/lib/store/services/map/MapSlice';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';

export default function useMapSidebarInit() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setOpenLocationDetails(false));
    dispatch(setSelectedLocation(null));
    dispatch(addSearchTerm(''));
  }, [dispatch]);
}
