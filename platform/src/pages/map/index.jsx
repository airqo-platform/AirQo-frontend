import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/components/Map/AirQoMap';
import Sidebar from '@/components/Map/components/sidebar';
import { getGridsDataSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import withAuth from '@/core/utils/protectedRoute';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import Layout from '@/components/Layout';
import { useWindowSize } from '@/lib/windowSize';

const Index = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const gridsDataSummary =
    useSelector((state) => state.grids.gridsDataSummary?.grids) || [];
  const preferences =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const selectedNode = useSelector((state) => state.map.selectedNode);

  const [siteDetails, setSiteDetails] = useState([]);
  const [pollutant] = useState('pm2_5');
  const isAdmin = true;

  // Fetch grid data summary
  const fetchGridsData = useCallback(() => {
    dispatch(getGridsDataSummary()).catch((error) => {
      console.error('Failed to fetch grids data:', error);
    });
  }, [dispatch]);

  useEffect(() => {
    fetchGridsData();
  }, [fetchGridsData]);

  // Set site details when grid data summary changes
  useEffect(() => {
    if (gridsDataSummary.length > 0) {
      const newSiteDetails = gridsDataSummary.flatMap((grid) => grid.sites);
      setSiteDetails(newSiteDetails);
    }
  }, [gridsDataSummary]);

  // Function to get random unique sites
  const getRandomSites = useCallback((sites, count) => {
    return sites
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .filter(
        (site, index, self) =>
          self.findIndex((s) => s._id === site._id) === index,
      );
  }, []);

  // Set suggested sites based on user preferences or randomly selected sites
  useEffect(() => {
    const preferencesSelectedSitesData =
      preferences.flatMap((pref) => pref.selected_sites) || [];

    if (preferencesSelectedSitesData.length > 0) {
      dispatch(addSuggestedSites(preferencesSelectedSitesData));
    } else if (siteDetails.length > 0) {
      const selectedSites = getRandomSites(siteDetails, 4);
      dispatch(addSuggestedSites(selectedSites));
    }
  }, [preferences, siteDetails, dispatch, getRandomSites]);

  // Get user's current location and store it in localStorage
  useEffect(() => {
    const storedUserLocation = JSON.parse(localStorage.getItem('userLocation'));
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
  }, []);

  // Responsive layout based on screen size
  const sidebarClassName =
    width < 1024
      ? `${selectedNode ? 'h-[70%]' : 'h-full w-full sidebar-scroll-bar'}`
      : 'h-full min-w-[380px] lg:w-[470px]';

  const mapClassName =
    width < 1024
      ? `${selectedNode ? 'h-[30%]' : 'h-full w-full'}`
      : 'h-full w-full';

  return (
    <Layout noTopNav={width < 1024}>
      <div className="relative flex flex-col-reverse lg:flex-row w-full h-dvh pt-2 pr-2 pb-2 pl-0 transition-all duration-500 ease-in-out">
        <div
          className={`${sidebarClassName} transition-all duration-500 ease-in-out`}
        >
          <Sidebar siteDetails={siteDetails} isAdmin={isAdmin} />
        </div>
        <div
          className={`${mapClassName} transition-all duration-500 ease-in-out`}
        >
          <AirQoMap
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            customStyle="flex-grow h-full w-full relative bg-[#e6e4e0]"
            pollutant={pollutant}
          />
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Index);
