'use client';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrganizationService } from '@/core/apis/Organizations';

// Import icons from react-icons
import {
  FaChartBar as AnalyticsIcon,
  FaMapMarkerAlt as MapIcon,
  FaCog as SettingsIcon,
  FaTachometerAlt as DashboardIcon,
} from 'react-icons/fa';

export default function OrganizationDashboardPage({ params }) {
  const router = useRouter();
  const { organization, primaryColor, secondaryColor } = useOrganization();
  const [stats, setStats] = useState({
    totalSites: 0,
    activeSites: 0,
    dataPoints: 0,
    lastUpdated: new Date(),
  });

  const orgSlug = params?.org_slug || '';

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
  const quickActions = [
    {
      title: 'Data Insights',
      description: 'View air quality data and trends',
      icon: <AnalyticsIcon className="w-8 h-8" />,
      href: `/org/${orgSlug}/insights`,
      color: primaryColor || 'bg-blue-500',
    },
    {
      title: 'Air Quality Map',
      description: 'Explore air quality monitoring locations',
      icon: <MapIcon className="w-8 h-8" />,
      href: `/org/${orgSlug}/map`,
      color: secondaryColor || 'bg-green-500',
    },
    {
      title: 'Organization Settings',
      description: 'Manage your organization preferences',
      icon: <SettingsIcon className="w-8 h-8" />,
      href: `/org/${orgSlug}/preferences`,
      color: primaryColor || 'bg-purple-500',
    },
  ];
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
      </div>
    </div>
  );
  const QuickActionCard = ({ title, description, icon, href, color }) => (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
      onClick={() => router.push(href)}
    >
      <div className="flex items-start space-x-4">
        <div
          className="rounded-lg p-3 text-white"
          style={{
            backgroundColor:
              typeof color === 'string' && color.startsWith('#')
                ? color
                : undefined,
          }}
          {...(typeof color === 'string' && !color.startsWith('#')
            ? { className: `${color} rounded-lg p-3 text-white` }
            : {})}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
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
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                New air quality data received
              </p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Daily report generated
              </p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                System maintenance completed
              </p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Organization Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Organization Name
            </h3>
            <p className="mt-1 text-lg text-gray-900">{organization.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Organization Type
            </h3>
            <p className="mt-1 text-lg text-gray-900">
              {OrganizationService.getDisplayName(organization)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Status
            </h3>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {organization.status}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Domain
            </h3>
            <p className="mt-1 text-lg text-gray-900">
              {organization.domain || 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
