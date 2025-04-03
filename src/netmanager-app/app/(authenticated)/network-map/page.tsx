"use client"
import React, { useState, useEffect, useCallback } from 'react';
import NetManagerMap from '@/components/NetManagerMap/page'
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '@/components/NetManagerMap/components/Sidebar/page';
import getGridsDataSummary from '@/core/redux/slices/gridsSlice';
// import withAuth from '@/core/utils/protectedRoute';

// import Layout from '@/components/Layout/page';
import { useWindowSize } from '@/lib/windowSize';
import { useAppSelector } from '@/core/redux/hooks';

const Index = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const gridsDataSummary = useAppSelector((state: any) => state.grids.gridsDataSummary?.grids) || [];
 
  const selectedNode = useSelector((state: any) => state.grids.gridsDataSummary?.grids) || [];

  const [pollutant] = useState('pm2_5');

//   Fetch grid data summary
//   const fetchGridsData = useCallback(() => {
//     return dispatch(getGridsDataSummary()).catch((error) => {
//                   console.error('Failed to fetch grids data:', error);
//           });
//   }, [dispatch]);

//   useEffect(() => {
//     fetchGridsData();
//   }, [fetchGridsData]);


  // Function to get random unique sites
  const getRandomSites = useCallback((sites: any[], count: any) => {
    const uniqueSites = sites.filter(
      (site, index, self) =>
        self.findIndex((s) => s._id === site._id) === index,
    );
    return uniqueSites.sort(() => 0.5 - Math.random()).slice(0, count);
  }, []);



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
        //   pollutant={pollutant}
        />
      </div>
  );
};

export default Index;
