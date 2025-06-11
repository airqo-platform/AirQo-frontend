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
import withOrgAuth from '@/core/HOC/withOrgAuth';

const OrganizationDashboardPage = () => {
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
      className="hover:shadow-md transition-shadow duration-200"
      padding="p-6"
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header with icon */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Simple Icon */}
          <div className="flex-shrink-0">
            <div
              className="w-10 h-10 flex justify-center items-center rounded-lg"
              style={{ backgroundColor: `${primaryColor || '#3B82F6'}10` }}
            >
              <div style={{ color: primaryColor || '#3B82F6' }}>{icon}</div>
            </div>
          </div>
        </div>

        {/* Main Value Display */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {value}
              </span>
            </div>
          </div>
        </div>

        {/* Simple Status */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Live Data
          </span>
        </div>
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
      {' '}
      {/* Welcome Section with Simple Design */}
      <CardWrapper className="relative overflow-hidden" padding="p-6">
        <div className="flex items-center space-x-4 relative z-10">
          {/* Organization Logo - Simple */}
          <div className="flex-shrink-0">
            {organization.logo ? (
              <Image
                src={organization.logo}
                alt={`${organization.name} logo`}
                width={60}
                height={60}
                className="rounded-lg"
              />
            ) : (
              <div className="w-15 h-15 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xl font-medium text-primary">
                  {organization.name?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Organization Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
              {organization.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {organization.description || 'Air Quality Monitoring Dashboard'}
            </p>

            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primaryColor || '#3B82F6' }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Live Dashboard
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>{' '}
      {/* Statistics Grid - Only 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Monitoring Sites"
          value={stats.totalSites}
          subtitle="Active monitoring locations"
          icon={<MapIcon className="w-5 h-5" />}
        />
        <StatCard
          title="Active Sites"
          value={stats.activeSites}
          subtitle="Currently reporting data"
          icon={<DashboardIcon className="w-5 h-5" />}
        />
        <StatCard
          title="Data Points Collected"
          value={stats.dataPoints.toLocaleString()}
          subtitle="Total measurements"
          icon={<AnalyticsIcon className="w-5 h-5" />}
        />
        <StatCard
          title="System Status"
          value="Online"
          subtitle={`Updated ${stats.lastUpdated.toLocaleTimeString()}`}
          icon={<DashboardIcon className="w-5 h-5" />}
        />
      </div>{' '}
    </div>
  );
};

export default withOrgAuth(OrganizationDashboardPage);
