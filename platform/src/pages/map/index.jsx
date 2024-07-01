import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/components/Map/AirQoMap';
import Sidebar from '@/components/Map/components/sidebar';
import { getSitesSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import withAuth from '@/core/utils/protectedRoute';
import { addSuggestedSites } from '@/lib/store/services/map/MapSlice';
import Layout from '@/components/Layout';
import { useWindowSize } from '@/lib/windowSize';

const index = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const siteData = useSelector((state) => state.grids.sitesSummary);
  const isAdmin = true;
  const [pollutant, setPollutant] = useState('pm2_5');
  const preferences = useSelector((state) => state.defaults.individual_preferences) || [];
  const chartSites = useSelector((state) => state.chart.chartSites);
  const selectedNode = useSelector((state) => state.map.selectedNode);

  /**
   * Site details
   */
  const siteDetails = siteData?.sites || [];

  useEffect(() => {
    const preferencesSelectedSitesData = preferences?.map((pref) => pref.selected_sites).flat();

    if (preferencesSelectedSitesData?.length > 0) {
      dispatch(addSuggestedSites(preferencesSelectedSitesData));
    } else {
      const getRandomSites = (siteDetails, count) => {
        const shuffledSites = siteDetails.sort(() => 0.5 - Math.random());
        const selectedSites = shuffledSites.slice(0, count);
        const uniqueSites = selectedSites.filter(
          (site, index, self) => self.findIndex((s) => s._id === site._id) === index,
        );
        return uniqueSites;
      };

      const selectedSites = getRandomSites(siteDetails, 4);
      dispatch(addSuggestedSites(selectedSites));
    }
  }, [preferences, chartSites]);

  useEffect(() => {
    const storedUserLocation = localStorage.getItem('userLocation')
      ? JSON.parse(localStorage.getItem('userLocation'))
      : null;
    if (!storedUserLocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        localStorage.setItem(
          'userLocation',
          JSON.stringify({ lat: position.coords.latitude, long: position.coords.longitude }),
        );
      });
    }
  }, [siteData]);

  /**
   * Fetch site details
   * @returns {void}
   */
  useEffect(() => {
    if (!siteDetails) {
      dispatch(getSitesSummary());
    }
  }, []);

  return (
    <Layout noTopNav={width < 1024}>
      <div className='relative flex flex-col-reverse lg:flex-row w-full h-dvh overflow-hidden transition-all duration-500 ease-in-out'>
        <div
          className={`${
            width < 1024
              ? selectedNode
                ? 'h-[70%]'
                : 'h-1/2 w-full sidebar-scroll-bar'
              : 'h-full min-w-[380px] lg:w-[470px]'
          } transition-all duration-500 ease-in-out`}>
          <Sidebar siteDetails={siteDetails} isAdmin={isAdmin} />
        </div>
        <div
          className={`${
            width < 1024 ? (selectedNode ? 'h-[30%]' : 'h-1/2 w-full') : 'h-full w-full'
          } transition-all duration-500 ease-in-out`}>
          <AirQoMap
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            customStyle='flex-grow h-full w-full relative bg-[#e6e4e0]'
            pollutant={pollutant}
          />
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(index);
