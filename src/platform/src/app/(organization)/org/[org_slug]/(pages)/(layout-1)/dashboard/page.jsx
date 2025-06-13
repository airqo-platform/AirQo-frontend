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
import { withOrgAuth } from '@/core/HOC';

const OrganizationDashboardPage = () => {
  const { organization } = useOrganization();
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    dataPoints: 0,
    lastUpdated: new Date(),
  });

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
      width="w-full"
      height="h-full"
      className=""
      contentClassName="flex flex-col gap-4"
      padding="p-4"
    >
      {/* Icon - Like user home page design but with icons */}
      <div className="flex items-start">
        <div className="w-12 h-12 flex justify-center items-center rounded-full bg-primary/10">
          <div className="text-primary text-lg">{icon}</div>
        </div>
      </div>

      {/* Step Content - Like user home page design */}
      <div>
        <p className="text-base font-medium">{title}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
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

      {/* Action Button - Like user home page design */}
      <div>
        <div className="flex justify-end">
          <span className="text-primary font-medium">Live</span>
        </div>
      </div>
    </CardWrapper>
  );
  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading organization dashboard...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
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
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
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
            </h1>{' '}
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {organization.description || 'Air Quality Monitoring Dashboard'}
            </p>
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Live Dashboard
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>{' '}
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
      </div>
    </div>
  );
};

export default withOrgAuth(OrganizationDashboardPage);
