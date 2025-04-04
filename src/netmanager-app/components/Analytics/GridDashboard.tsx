import React, { useState, useMemo, useEffect } from "react";
import { PollutantCategory } from "./PollutantCategory";
import { LineCharts } from "../Charts/Line";
import { BarCharts } from "../Charts/Bar";
import { ExceedancesChart } from "./ExceedanceLine";
import { PM_25_CATEGORY } from "@/core/hooks/categories";
import { Grid } from "@/app/types/grids";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Site } from "@/app/types/sites";

interface Categories {
  [key: string]: SiteWithPM25[];
}

interface SiteWithPM25 extends Site {
  pm2_5: number;
  label: string;
}

interface RecentEventFeature {
  properties: {
    site_id: string;
    pm2_5?: { value: number };
  };
}

interface GridDashboardProps {
  gridId: string | null;
  loading: boolean;
  grids: Grid[];
  recentEventsData: { features: RecentEventFeature[] };
}

const GridDashboard: React.FC<GridDashboardProps> = ({
  gridId,
  loading,
  grids,
  recentEventsData,
}) => {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [pm2_5SiteCount, setPm2_5SiteCount] = useState<{
    Good: SiteWithPM25[];
    Moderate: SiteWithPM25[];
    UHFSG: SiteWithPM25[];
    Unhealthy: SiteWithPM25[];
    VeryUnhealthy: SiteWithPM25[];
    Hazardous: SiteWithPM25[];
  }>({
    Good: [],
    Moderate: [],
    UHFSG: [],
    Unhealthy: [],
    VeryUnhealthy: [],
    Hazardous: [],
  });

  const activeGrid = useMemo(
    () => grids.find((grid) => grid._id === gridId),
    [grids, gridId]
  );

  useEffect(() => {
    if (!activeGrid || !recentEventsData?.features) return;

    const categorizeSite = (
      site: Site,
      pm2_5: number,
      categories: Categories
    ) => {
      Object.keys(PM_25_CATEGORY).forEach((key) => {
        const [min, max] = PM_25_CATEGORY[key as keyof typeof PM_25_CATEGORY];
        if (pm2_5 >= 0 && pm2_5 > min && pm2_5 <= max) {
          const siteWithPM25: SiteWithPM25 = {
            ...site,
            pm2_5,
            label: site.name || site.description || site.generated_name || ""
          };
          categories[key].push(siteWithPM25);
        }
      });
    };

    const initialCount = {
      Good: [],
      Moderate: [],
      UHFSG: [],
      Unhealthy: [],
      VeryUnhealthy: [],
      Hazardous: [],
    };

    const gridSitesObj = activeGrid.sites.reduce(
      (acc: Record<string, Site>, curr: Site) => {
        acc[curr._id] = curr;
        return acc;
      },
      {}
    );

    recentEventsData.features.forEach((feature: RecentEventFeature) => {
      const siteId = feature.properties.site_id;
      const site = gridSitesObj[siteId];

      if (site) {
        const pm2_5 = feature.properties.pm2_5?.value || 0;
        categorizeSite(site, pm2_5, initialCount);
      }
    });

    setPm2_5SiteCount(initialCount);
  }, [activeGrid, recentEventsData]);

  const categories: {
    pm25level: keyof typeof pm2_5SiteCount;
    iconClass: string;
  }[] = [
    { pm25level: "Good", iconClass: "bg-green-500" },
    { pm25level: "Moderate", iconClass: "bg-yellow-500" },
    { pm25level: "UHFSG", iconClass: "bg-orange-500" },
    { pm25level: "Unhealthy", iconClass: "bg-red-500" },
    { pm25level: "VeryUnhealthy", iconClass: "bg-purple-500" },
    { pm25level: "Hazardous", iconClass: "bg-rose-900" },
  ];

  if (!activeGrid && !loading) {
    return <div>Please select a grid to view its dashboard.</div>;
  }

  return (
    <div>
      <div>
        <div className="mb-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Grid Name</h3>
            <p className="lg:text-2xl md:text-sm sm:text-sm font-bold capitalize">
              {loading ? "..." : activeGrid?.name || "N/A"}
            </p>
          </div>
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">Admin Level</h3>
            <p className="lg:text-2xl md:text-sm sm:text-sm font-bold capitalize">
              {loading ? "..." : activeGrid?.admin_level || "N/A"}
            </p>
          </div>
          <div className="p-4 border text-center rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600">
              Number of Sites
            </h3>
            <p className="lg:text-2xl md:text-sm sm:text-sm font-bold">
              {loading ? "..." : activeGrid?.sites.length || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl">
          <div className="flex flex-wrap justify-between gap-4">
            {categories.map((category, index) => (
              <div key={index} className="flex-1 min-w-[100px] max-w-[150px]">
                <PollutantCategory
                  pm25level={category.pm25level}
                  iconClass={category.iconClass}
                  sites={pm2_5SiteCount[category.pm25level] || []}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h4>Mean Daily PM 2.5 Over the Past 28 Days</h4>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-label="Toggle chart type"
                    >
                      <path
                        d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setChartType("line")}>
                    Line
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChartType("bar")}>
                    Bar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {chartType === "line" ? <LineCharts /> : <BarCharts />}
          </CardContent>
        </Card>
        <ExceedancesChart
          isCohorts={false}
          isGrids={true}
          analyticsDevices={[]}
          analyticsSites={activeGrid?.sites || []}
        />
      </div>
    </div>
  );
};

export default GridDashboard;
