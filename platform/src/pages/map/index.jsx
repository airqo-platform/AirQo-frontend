import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AirQoMap from '@/components/Map/AirQoMap';
import Sidebar from '@/components/Map/components/Sidebar';
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

  /**
   * Site details
   */
  const siteDetails = siteData?.sites || [];

  useEffect(() => {
    const preferencesSelectedSitesData = preferences?.map((pref) => pref.selected_sites).flat();

    if (preferencesSelectedSitesData?.length > 0) {
      dispatch(addSuggestedSites(preferencesSelectedSitesData));
    } else if (siteDetails) {
      const selectedSites = siteDetails.filter((site) => chartSites.includes(site.site_id));
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
      <div className='relative flex flex-col-reverse lg:flex-row w-full h-full overflow-hidden'>
        <Sidebar siteDetails={siteDetails} isAdmin={isAdmin} />

        <AirQoMap
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          customStyle='flex-grow h-full lg:h-dvh w-full relative bg-[#e6e4e0]'
          pollutant={pollutant}
        />
      </div>
    </Layout>
  );
};

export default withAuth(index);
