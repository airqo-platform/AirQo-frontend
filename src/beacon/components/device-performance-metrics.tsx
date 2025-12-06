import { useState, useEffect } from "react";
import { Activity, AlertTriangle, Battery, Clock, RefreshCw, Signal, Timer } from "lucide-react";

const DevicePerformanceMetrics = ({ deviceId = "device-001" }) => {
  const [data, setData] = useState({
    uptime: 93.7,
    batteryHealth: 87.2,
    signalQuality: 84.5,
    mtbf: 52,
    mttr: 4.5,
    lastMaintenance: "2025-03-03",
    maintenanceType: "Routine",
    status: "active",
    statusDuration: 45
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format percentages with proper precision
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `${Number(value).toFixed(1)}%`;
  };

  // Refresh data
  const refreshData = () => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === "active") return "bg-green-500";
    if (status === "maintenance") return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get metric color 
  const getMetricColor = (value) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Device Hardware Performance</h2>
        <button 
          className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          onClick={refreshData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Status Indicator */}
      <div className="border border-gray-200 rounded-md border-l-4 border-l-blue-500 mb-6">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Device Status</p>
              <p className="text-xl font-medium">
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-white ${getStatusColor(data.status)}`}>
              {data.statusDuration} days
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Uptime Card */}
        <div className="border border-gray-200 rounded-md p-5">
          <div className="flex flex-col items-center">
            <div className="rounded-full p-3 mb-2 bg-blue-100">
              <Activity className={`h-6 w-6 ${getMetricColor(data.uptime)}`} />
            </div>
            <div className="text-2xl font-bold">{formatPercentage(data.uptime)}</div>
            <p className="text-gray-500 text-sm">Device Uptime</p>
          </div>
        </div>

        {/* Battery Health Card */}
        <div className="border border-gray-200 rounded-md p-5">
          <div className="flex flex-col items-center">
            <div className="rounded-full p-3 mb-2 bg-orange-100">
              <Battery className={`h-6 w-6 ${getMetricColor(data.batteryHealth)}`} />
            </div>
            <div className="text-2xl font-bold">{formatPercentage(data.batteryHealth)}</div>
            <p className="text-gray-500 text-sm">Battery Health</p>
          </div>
        </div>

        {/* Signal Quality Card */}
        <div className="border border-gray-200 rounded-md p-5">
          <div className="flex flex-col items-center">
            <div className="rounded-full p-3 mb-2 bg-purple-100">
              <Signal className={`h-6 w-6 ${getMetricColor(data.signalQuality)}`} />
            </div>
            <div className="text-2xl font-bold">{formatPercentage(data.signalQuality)}</div>
            <p className="text-gray-500 text-sm">Signal Quality</p>
          </div>
        </div>
      </div>

      {/* Reliability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* MTBF Card */}
        <div className="border border-gray-200 rounded-md">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-lg">Mean Time Between Failures</h3>
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full p-3 mb-2 bg-blue-100">
                <Timer className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold">{data.mtbf} days</div>
              <p className="text-gray-500 text-sm mt-2">Average time device operates without failure</p>
            </div>
          </div>
        </div>

        {/* MTTR Card */}
        <div className="border border-gray-200 rounded-md">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-lg">Mean Time To Recovery</h3>
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full p-3 mb-2 bg-purple-100">
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold">{data.mttr} hours</div>
              <p className="text-gray-500 text-sm mt-2">Average time to restore after failure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Info */}
      <div className="border border-gray-200 rounded-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-lg">Last Maintenance</h3>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-xl font-medium">{data.lastMaintenance}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-white ${
              data.maintenanceType === "Routine" ? "bg-green-500" : 
              data.maintenanceType === "Repair" ? "bg-red-500" : 
              "bg-blue-500"
            }`}>
              {data.maintenanceType}
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-start">
              <div className="min-w-4 mr-2">•</div>
              <div className="text-sm text-gray-600">
                {data.maintenanceType === "Routine" 
                  ? "Regular calibration and cleaning" 
                  : "Hardware repairs and maintenance"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add device info at bottom */}
      <div className="mt-6 text-sm text-gray-500 flex justify-between items-center">
        <div>Device ID: {deviceId}</div>
        <div>Last updated: {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

export default DevicePerformanceMetrics;