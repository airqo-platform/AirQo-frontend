'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CardWrapper from '@/common/components/CardWrapper';

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
    <CardWrapper
      title={title}
      icon={
        <div
          className="text-white p-3 rounded-lg"
          style={{ backgroundColor: primaryColor || '#3B82F6' }}
        >
          {icon}
        </div>
      }
      className="hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: primaryColor || '#3B82F6' }}
      hoverable={true}
    >
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </CardWrapper>
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
      <CardWrapper
        className="relative overflow-hidden border-t-4"
        style={{ borderTopColor: primaryColor || '#3B82F6' }}
        padding="p-8"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to {organization.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {organization.description || 'Air Quality Monitoring Dashboard'}
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primaryColor || '#3B82F6' }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Live Dashboard
                </span>
              </div>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>

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
