"use client"

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoreHorizontal } from 'lucide-react';
import { EXCEEDANCES_DATA_URI, DEVICE_EXCEEDANCES_URI } from '@/core/urls';
import createAxiosInstance from '@/core/apis/axiosConfig';
import { Device } from '@/app/types/devices';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';

interface AnalyticsSite {
  _id: string;
  name?: string;
  description?: string;
  generated_name?: string;
}

interface ChartData {
  name: string;
  Good: number;
  Moderate: number;
  UHFSG: number;
  Unhealthy: number;
  VeryUnhealthy: number;
  Hazardous: number;
}

interface ExceedancesChartProps {
  analyticsSites: AnalyticsSite[];
  analyticsDevices: Device[];
  isGrids: boolean;
  isCohorts: boolean;
}

const chartConfig = {
  Good: { label: "Good", color: "hsl(120, 100%, 25%)" },
  Moderate: { label: "Moderate", color: "hsl(60, 100%, 50%)" },
  UHFSG: { label: "Unhealthy for Sensitive Groups", color: "hsl(30, 100%, 50%)" },
  Unhealthy: { label: "Unhealthy", color: "hsl(0, 100%, 50%)" },
  VeryUnhealthy: { label: "Very Unhealthy", color: "hsl(300, 100%, 25%)" },
  Hazardous: { label: "Hazardous", color: "hsl(0, 0%, 20%)" },
};

export const ExceedancesChart: React.FC<ExceedancesChartProps> = ({
  analyticsSites,
  analyticsDevices,
  isGrids,
  isCohorts,
}) => {
  const [loading, setLoading] = useState(false);
  const [averageSites, setAverageSites] = useState<string[]>([]);
  const [averageDevices, setAverageDevices] = useState<string[]>([]);
  const [dataset, setDataset] = useState<ChartData[]>([]);
  const [pollutant, setPollutant] = useState({ value: 'pm2_5', label: 'PM 2.5' });
  const [standard, setStandard] = useState({ value: 'aqi', label: 'AQI' });
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [allLocationsDialogOpen, setAllLocationsDialogOpen] = useState(false);
  const [allLocationsData, setAllLocationsData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (isGrids) {
      const siteOptions = analyticsSites.map((site) => site._id);
      setAverageSites(siteOptions);
    }
  }, [analyticsSites, isGrids]);

  useEffect(() => {
    if (isCohorts) {
      const deviceOptions = analyticsDevices.map((device) => device.long_name);
      setAverageDevices(deviceOptions);
    }
  }, [analyticsDevices, isCohorts]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const filter = {
        pollutant: pollutant.value,
        standard: standard.value,
        startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        ...(isGrids ? { sites: averageSites } : { devices: averageDevices }),
      };

      try {
        const response = await createAxiosInstance().post(
          isCohorts ? DEVICE_EXCEEDANCES_URI : EXCEEDANCES_DATA_URI,
          filter
        );
        const data = response.data.data;
        processChartData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setDataset([]);
      }
      setLoading(false);
    };

    if ((isGrids && averageSites.length) || (isCohorts && averageDevices.length)) {
      fetchData();
    }
  }, [averageSites, averageDevices, isGrids, isCohorts, pollutant, standard]);

  const processChartData = (data: ChartData[]) => {
    setDataset(data);
    setAllLocationsData(data);
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h5>{pollutant.label} Exceedances Over the Past 28 Days Based on {standard.label}</h5>
        <Button variant="outline" size="icon" onClick={() => setCustomizeDialogOpen(true)}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
          <Skeleton className="h-[200px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        ) : dataset.length === 0 ? (
          <div className="flex justify-center items-center h-64">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {Object.entries(chartConfig).map(([key, config]) => (
                <Bar key={key} dataKey={key} fill={config.color} stackId="a" />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      {/* <div className="flex justify-end p-4">
        <Button variant="link" onClick={() => setAllLocationsDialogOpen(true)}>
          View all Exceedances <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div> */}

      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Chart</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pollutant" className="text-right">
                Pollutant
              </Label>
              <Select
                value={pollutant.value}
                onValueChange={(value) => setPollutant({ value, label: value.toUpperCase() })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pollutant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm2_5">PM 2.5</SelectItem>
                  <SelectItem value="pm10">PM 10</SelectItem>
                  <SelectItem value="no2">NO2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="standard" className="text-right">
                Standard
              </Label>
              <Select
                value={standard.value}
                onValueChange={(value) => setStandard({ value, label: value.toUpperCase() })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqi">AQI</SelectItem>
                  <SelectItem value="who">WHO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setCustomizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCustomizeDialogOpen(false)}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={allLocationsDialogOpen} onOpenChange={setAllLocationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Locations Exceedances</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {allLocationsData.map((location, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isCohorts
                      ? location.device_id
                      : location.site.name || location.site.description || location.site.generated_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[location]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.entries(chartConfig).map(([key, config]) => (
                        <Bar
                          key={key}
                          dataKey={isCohorts ? `exceedances.${key}` : `exceedance.${key}`}
                          fill={config.color}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setAllLocationsDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

