"use client"
import React, { useState, useEffect, useCallback } from 'react';
import NetManagerMap from '@/components/NetManagerMap/page'
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '@/components/NetManagerMap/components/Sidebar/page';
// import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
// import withAuth from '@/core/utils/protectedRoute';
// import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import Layout from '@/components/Layout/page';
import { useWindowSize } from '@/lib/windowSize';

const Index = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const gridsDataSummary = useSelector((state: any) => state.grids.gridsDataSummary?.grids) || [];
  const preferences = useSelector((state: any) => state.grids.gridsDataSummary?.grids) || [];
  const selectedNode = useSelector((state: any) => state.grids.gridsDataSummary?.grids) || [];

  const [siteDetails, setSiteDetails] = useState([]);
  const [pollutant] = useState('pm2_5');
  const isAdmin = true;

  // Fetch grid data summary
//   const fetchGridsData = useCallback(() => {
//     dispatch(getGridsDataSummary()).catch((error) => {
//       console.error('Failed to fetch grids data:', error);
//     });
//   }, [dispatch]);

//   useEffect(() => {
//     fetchGridsData();
//   }, [fetchGridsData]);

  // Set site details when grid data summary changes
  useEffect(() => {
    if (Array.isArray(gridsDataSummary) && gridsDataSummary.length > 0) {
      const newSiteDetails = gridsDataSummary.flatMap(
        (grid) => grid.sites || [],
      );
      setSiteDetails(newSiteDetails);
    }
  }, [gridsDataSummary]);

  // Function to get random unique sites
  const getRandomSites = useCallback((sites, count) => {
    const uniqueSites = sites.filter(
      (site, index, self) =>
        self.findIndex((s) => s._id === site._id) === index,
    );
    return uniqueSites.sort(() => 0.5 - Math.random()).slice(0, count);
  }, []);

  // Set suggested sites based on user preferences or randomly selected sites
  useEffect(() => {
    const preferencesSelectedSitesData = preferences.flatMap(
      (pref) => pref.selected_sites || [],
    );

    if (preferencesSelectedSitesData.length > 0) {
      dispatch(addSuggestedSites(preferencesSelectedSitesData));
    } else if (siteDetails.length > 0) {
      const selectedSites = getRandomSites(siteDetails, 4);
      dispatch(addSuggestedSites(selectedSites));
    }
  }, [preferences, siteDetails, dispatch, getRandomSites]);

  // Get user's current location and store it in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserLocation = localStorage.getItem('userLocation');
      if (!storedUserLocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            localStorage.setItem(
              'userLocation',
              JSON.stringify({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }),
            );
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
        );
      }
    }
  }, []);



  return (
        <div
        className={` transition-all duration-500 ease-in-out `}
      >
        <NetManagerMap
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          customStyle="flex-grow h-full w-full relative bg-[#e6e4e0]"
          pollutant={pollutant}
        />
      </div>
  );
};

export default Index;
