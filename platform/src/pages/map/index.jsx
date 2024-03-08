import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MapLayout from '@/components/Layout/MapLayout';
import MenuIcon from '@/icons/map/menuIcon';
import AirQoMap from '@/components/Map/AirQoMap';
import { useRouter } from 'next/router';
import { AirQualityLegend } from '@/components/Map/components/Legend';
import Sidebar from '@/components/Map/components/Sidebar';
import { getSitesSummary } from '@/lib/store/services/deviceRegistry/GridsSlice';
import withAuth from '@/core/utils/protectedRoute';

const index = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showSideBar, setShowSideBar] = useState(true);
  const siteData = useSelector((state) => state.grids?.sitesSummary);
  const isAdmin = true;
  const preferenceData = useSelector((state) => state.defaults?.individual_preferences);
  const [pollutant, setPollutant] = useState('pm2_5');

  /**
   * Selected sites
   */
  const selectedSites = preferenceData
    ? preferenceData.map((pref) => pref.selected_sites).flat()
    : [];

  /**
   * Site details
   */
  const siteDetails = siteData?.sites || [];

  /**
   * Fetch site details
   * @returns {void}
   */
  useEffect(() => {
    dispatch(getSitesSummary());
  }, []);

  /**
   * Show/hide sidebar on window resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (
        (window.innerWidth < 768 || (window.innerWidth >= 600 && window.innerWidth <= 800)) &&
        router.pathname === '/map'
      ) {
        setShowSideBar(false);
      } else {
        setShowSideBar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [router.pathname]);

  return (
    <MapLayout noTopNav={false}>
      <div className='relative flex w-full h-full'>
        {showSideBar && (
          <Sidebar
            siteDetails={siteDetails}
            selectedSites={selectedSites}
            isAdmin={isAdmin}
            showSideBar={showSideBar}
            setShowSideBar={setShowSideBar}
          />
        )}
        <div className={`${showSideBar ? 'hidden' : ''} relative left-4 z-50 md:block`}>
          <div className={`absolute bottom-2`} style={{ zIndex: 900 }}>
            <AirQualityLegend pollutant={pollutant} />
          </div>
          <div className={`absolute top-4`}>
            <div className='flex flex-col space-y-4'>
              <button
                className={`inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md lg:hidden`}
                onClick={() => setShowSideBar(!showSideBar)}>
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>

        <AirQoMap
          showSideBar={showSideBar}
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          customStyle='flex-grow h-screen w-full relative bg-[#e6e4e0]'
          pollutant={pollutant}
          resizeMap={showSideBar}
        />
      </div>
    </MapLayout>
  );
};
export default withAuth(index);
