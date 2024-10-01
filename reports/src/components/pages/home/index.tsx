'use client';
import React, { useState, useEffect } from 'react';

import ReportForm from '../../forms/report/ReportForm';

import SkeletonLoader from './SkeletonLoader';

import HelpPopup from '@/components/helpDesk/HelpPopup';
import { getGridData } from '@/services/api';

const Index = () => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
  }, [grids]);

  return (
    <div>
      <div className="report-generator space-y-5">
        {loading ? <SkeletonLoader /> : <ReportForm grids={grids} />}
      </div>

      {/* Render HelpPopup Component */}
      <HelpPopup />
    </div>
  );
};

export default Index;
