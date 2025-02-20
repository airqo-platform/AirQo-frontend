'use client';
import React, { useState, useEffect } from 'react';

import ReportForm from '../../components/forms/report/ReportForm';

import SkeletonLoader from './_sections/SkeletonLoader';

import MainLayout from '@/layout/MainLayout';
import { getGridData } from '@/services/api';

const Page = () => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Check if grids data has already been fetched
      if (grids.length > 0) {
        return;
      }

      setLoading(true);
      try {
        const { grids, success } = await getGridData();
        if (!success) {
          throw new Error('Error fetching data');
        }
        setGrids(grids);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [grids]); // Add grids as a dependency

  return (
    <MainLayout>
      <div className="report-generator space-y-5">
        {loading ? <SkeletonLoader /> : <ReportForm grids={grids} />}
      </div>
    </MainLayout>
  );
};

export default Page;
