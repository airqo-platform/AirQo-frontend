"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  Activity,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { format, subDays, differenceInHours, differenceInDays } from "date-fns";

// This component displays device uptime analysis only
export default function DeviceUptimeAnalysis({ devices = [], isLoading = false }) {
  // Calculate device reliability metrics
  const calculateReliabilityMetrics = () => {
    if (!devices || devices.length === 0) return null;

    // Group maintenance events by device for analysis
    const deviceMaintenanceMap = {};
    let totalOfflineEvents = 0;
    let totalRestoredEvents = 0;
    
    devices.forEach(device => {
      const events = device.maintenance_history || [];
      
      if (events.length > 0) {
        if (!deviceMaintenanceMap[device.device.id]) {
          deviceMaintenanceMap[device.device.id] = {
            deviceId: device.device.id,
            deviceName: device.device.name,
            events: [],
            offlineCount: 0,
            restoredCount: 0,
            downtime: 0, // Total downtime in hours
            downtimePeriods: [] // Array of downtime periods
          };
        }
        
        // Sort events by timestamp
        const sortedEvents = [...events].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        deviceMaintenanceMap[device.device.id].events = sortedEvents;
        
        // Count offline and restored events
        let lastOffline = null;
        
        sortedEvents.forEach(event => {
          if (event.maintenance_type === "Offline") {
            deviceMaintenanceMap[device.device.id].offlineCount++;
            totalOfflineEvents++;
            lastOffline = new Date(event.timestamp);
          } else if (event.maintenance_type === "Restored") {
            deviceMaintenanceMap[device.device.id].restoredCount++;
            totalRestoredEvents++;
            
            // Calculate downtime if we have a matching offline event
            if (lastOffline) {
              const restoredTime = new Date(event.timestamp);
              const downtimeHours = differenceInHours(restoredTime, lastOffline);
              
              deviceMaintenanceMap[device.device.id].downtime += downtimeHours;
              deviceMaintenanceMap[device.device.id].downtimePeriods.push({
                start: lastOffline,
                end: restoredTime,
                hours: downtimeHours
              });
              
              lastOffline = null;
            }
          }
        });
      }
    });

    // Calculate uptime percentage for each device with events
    Object.values(deviceMaintenanceMap).forEach(device => {
      if (device.events.length > 0) {
        // Calculate monitoring period
        const firstEvent = new Date(device.events[0].timestamp);
        const lastEvent = new Date(device.events[device.events.length - 1].timestamp);
        const monitoringHours = differenceInHours(lastEvent, firstEvent) || 1; // Avoid division by zero
        
        // Calculate uptime percentage
        device.uptimePercentage = ((monitoringHours - device.downtime) / monitoringHours) * 100;
        
        // Calculate average downtime duration
        device.avgDowntimeDuration = device.downtimePeriods.length > 0
          ? device.downtime / device.downtimePeriods.length
          : 0;
        
        // Calculate MTBF (Mean Time Between Failures) in hours
        device.mtbf = device.offlineCount > 1
          ? monitoringHours / (device.offlineCount - 1)
          : monitoringHours;
      }
    });

    // Convert to array and sort by uptime percentage
    const deviceMetrics = Object.values(deviceMaintenanceMap)
      .filter(device => device.events.length > 0)
      .sort((a, b) => a.uptimePercentage - b.uptimePercentage);

    // Calculate average metrics across all devices
    const avgUptimePercentage = deviceMetrics.length > 0
      ? deviceMetrics.reduce((sum, device) => sum + device.uptimePercentage, 0) / deviceMetrics.length
      : 0;
    
    const avgDowntimeDuration = deviceMetrics.length > 0
      ? deviceMetrics.reduce((sum, device) => sum + device.avgDowntimeDuration, 0) / deviceMetrics.length
      : 0;
    
    const avgMtbf = deviceMetrics.length > 0
      ? deviceMetrics.reduce((sum, device) => sum + device.mtbf, 0) / deviceMetrics.length
      : 0;

    // Identify devices with most frequent failures
    const worstPerformers = [...deviceMetrics]
      .sort((a, b) => b.offlineCount - a.offlineCount)
      .slice(0, 5);

    return {
      deviceMetrics,
      avgUptimePercentage,
      avgDowntimeDuration,
      avgMtbf,
      totalOfflineEvents,
      totalRestoredEvents,
      worstPerformers
    };
  };

  const reliabilityMetrics = calculateReliabilityMetrics();

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Device Uptime Analysis
        </CardTitle>
        <CardDescription>
          Insights into device uptime performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : !reliabilityMetrics ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reliability data available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Average Uptime</div>
                <div className="text-2xl font-bold">
                  {reliabilityMetrics.avgUptimePercentage.toFixed(1)}%
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${reliabilityMetrics.avgUptimePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Avg. Downtime Duration</div>
                <div className="text-2xl font-bold">
                  {reliabilityMetrics.avgDowntimeDuration.toFixed(1)} hours
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Average time devices remain offline before restoration
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Mean Time Between Failures</div>
                <div className="text-2xl font-bold">
                  {(reliabilityMetrics.avgMtbf / 24).toFixed(1)} days
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Average time between device offline events
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Devices with Lowest Uptime</h3>
              <div className="space-y-2">
                {reliabilityMetrics.worstPerformers.map((device, index) => (
                  <div 
                    key={device.deviceId} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <WifiOff className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium">{device.deviceName}</div>
                        <div className="text-xs text-gray-500">
                          {device.offlineCount} offline events
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        {device.uptimePercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        uptime
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t px-4 py-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Activity className="mr-2 h-4 w-4 text-primary" />
          Device uptime and reliability metrics
        </div>
      </CardFooter>
    </Card>
  );
}