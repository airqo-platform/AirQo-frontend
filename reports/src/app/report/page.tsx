"use client";
import MainLayout from "@/layout/MainLayout";
import React, { useState, useEffect } from "react";
import { getGridData } from "@/services/api";
import SkeletonLoader from "./_sections/SkeletonLoader";
import ReportForm from "./_sections/ReportForm";

const Page = () => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { grids, success } = await getGridData();
        if (!success) {
          throw new Error("Error fetching data");
        }
        setGrids(grids);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="report-generator space-y-5">
        {loading ? <SkeletonLoader /> : <ReportForm grids={grids} />}
      </div>
    </MainLayout>
  );
};

export default Page;
