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
  const [pollutant, setPollutant] = useState('pm2_5');
  const [selectedSites, setSelectedSites] = useState([]);

  /**
   * Site details
   */
  const siteDetails = siteData?.sites || [];

  // const findNearbySites = (location) => {
  //   try {
  //     const { lat, long } = location;
  //     let distance = 10;
  //     let nearbySites = [];

  //     nearbySites =
  //       siteDetails &&
  //       siteDetails.filter((site) => {
  //         const siteLat = site.latitude;
  //         const siteLong = site.longitude;
  //         const siteDistance = Math.sqrt(Math.pow(lat - siteLat, 2) + Math.pow(long - siteLong, 2));
  //         return siteDistance < distance;
  //       });

  //     return nearbySites;
  //   } catch (error) {
  //     console.error('Error finding nearby sites:', error);
  //     return [];
  //   }
  // };

  const findNearbySites = (location) => {
    try {
      const { lat, long } = location;
      const maxDistance = 0.1;
      const numberOfNearestSites = 6;
      let nearestSites = [];

      siteData &&
        siteData.forEach((site) => {
          const siteLat = site.latitude;
          const siteLong = site.longitude;
          const siteDistance = Math.sqrt(Math.pow(lat - siteLat, 2) + Math.pow(long - siteLong, 2));

          console.log('siteDistance', siteDistance);

          if (siteDistance < maxDistance) {
            if (nearestSites.length < numberOfNearestSites) {
              nearestSites.push({ ...site, distance: siteDistance });
            } else {
              const maxDistanceSite = nearestSites.reduce((prev, current) =>
                prev.distance > current.distance ? prev : current,
              );

              if (siteDistance < maxDistanceSite.distance) {
                const index = nearestSites.indexOf(maxDistanceSite);
                nearestSites[index] = { ...site, distance: siteDistance };
              }
            }
          }
        });

      return nearestSites;
    } catch (error) {
      console.error('Error finding nearest sites:', error);
      return [];
    }
  };

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

  useEffect(() => {
    const storedUserLocation = localStorage.getItem('userLocation')
      ? JSON.parse(localStorage.getItem('userLocation'))
      : null;

    if (storedUserLocation) {
      setSelectedSites(findNearbySites(storedUserLocation));
    }
  }, [siteData]);

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
      <div className='relative'>
        <>
          {showSideBar && (
            <Sidebar
              siteDetails={siteDetails}
              selectedSites={selectedSites}
              isAdmin={isAdmin}
              showSideBar={showSideBar}
              setShowSideBar={setShowSideBar}
            />
          )}
          <div className={`${showSideBar ? 'hidden' : ''} md:hidden`}>
            <div
              className={`absolute bottom-2 ${
                showSideBar ? 'left-[calc(280px+15px)] md:left-[calc(340px+15px)]' : 'left-[15px]'
              } `}
              style={{ zIndex: 900 }}
            >
              <AirQualityLegend pollutant={pollutant} />
            </div>
            <div
              className={`absolute top-4 ${
                showSideBar ? 'left-[calc(280px+15px)] md:left-[calc(340px+15px)]' : 'left-[15px]'
              } z-50`}
            >
              <div className='flex flex-col space-y-4'>
                <button
                  className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'
                  onClick={() => setShowSideBar(!showSideBar)}
                >
                  <MenuIcon />
                </button>
              </div>
            </div>
          </div>
        </>
        <AirQoMap
          showSideBar={showSideBar}
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          customStyle='flex-grow h-screen w-full relative bg-[#e6e4e0]'
          pollutant={pollutant}
        />
      </div>
    </MapLayout>
  );
};
export default withAuth(index);
