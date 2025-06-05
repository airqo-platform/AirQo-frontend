'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// Import icons from react-icons
import {
  FaMapMarkerAlt as MapIcon,
  FaTachometerAlt as DashboardIcon,
  FaChartBar as AnalyticsIcon,
} from 'react-icons/fa';

export default function OrganizationDashboardPage() {
  const { organization, primaryColor, secondaryColor } = useOrganization();
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    dataPoints: 0,
    lastUpdated: new Date(),
  });

  // Apply organization theme
  useEffect(() => {
    if (primaryColor && secondaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--org-primary', primaryColor);
      root.style.setProperty('--org-secondary', secondaryColor);
    }
  }, [primaryColor, secondaryColor]);

  // Simulate loading organization stats
  useEffect(() => {
    if (organization) {
      // In a real application, this would fetch actual data
      const mockStats = {
        totalSites: Math.floor(Math.random() * 50) + 10,
        activeSites: Math.floor(Math.random() * 40) + 8,
        dataPoints: Math.floor(Math.random() * 100000) + 50000,
        lastUpdated: new Date(),
      };
      setStats(mockStats);
    }
  }, [organization]);

  const StatCard = ({ title, value, subtitle, icon }) => (
    <div
      className="bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow"
      style={{ borderLeftColor: primaryColor || '#3B82F6' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className="text-white p-3 rounded-lg"
            style={{ backgroundColor: primaryColor || '#3B82F6' }}
          >
            {icon}
          </div>
        )}
      </div>{' '}
    </div>
  );

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading organization dashboard...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Welcome Section with Organization Branding */}
      <div
        className="bg-white rounded-lg shadow-sm border-t-4 p-8 relative overflow-hidden"
        style={{ borderTopColor: primaryColor || '#3B82F6' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 opacity-10">
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: primaryColor || '#3B82F6' }}
          />
        </div>

        <div className="flex items-center space-x-4 relative z-10">
          {organization.logo && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-lg blur-md opacity-30"
                style={{ backgroundColor: primaryColor || '#3B82F6' }}
              />
              <Image
                src={organization.logo}
                alt={`${organization.name} logo`}
                width={64}
                height={64}
                className="relative rounded-lg"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to {organization.name}
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              {organization.description || 'Air Quality Monitoring Dashboard'}
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primaryColor || '#3B82F6' }}
                />
                <span className="text-sm text-gray-500">Live Dashboard</span>
              </div>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Monitoring Sites"
          value={stats.totalSites}
          subtitle="Active locations"
          icon={<MapIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Active Sites"
          value={stats.activeSites}
          subtitle="Currently reporting"
          icon={<DashboardIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Data Points"
          value={stats.dataPoints.toLocaleString()}
          subtitle="Total collected"
          icon={<AnalyticsIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Last Updated"
          value={stats.lastUpdated.toLocaleTimeString()}
          subtitle={stats.lastUpdated.toLocaleDateString()}
          icon={<DashboardIcon className="w-6 h-6" />}
        />{' '}
      </div>
    </div>
  );
}
