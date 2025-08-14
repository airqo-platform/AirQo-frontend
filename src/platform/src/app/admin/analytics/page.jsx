'use client';
import { useEffect, useMemo, useState } from 'react';
import ReusableTable from '@/components/Table';
import { getUsersAnalyticsApi } from '@/core/apis/Account';

const StatCard = ({ label, value, accent = 'bg-primary' }) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-[#1d1f20] shadow-sm">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
      {value ?? 0}
    </div>
    <div className={`mt-3 h-1.5 w-16 rounded ${accent}`} />
  </div>
);

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Columns reused for the detail tables
  const userCols = useMemo(
    () => [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
    ],
    [],
  );

  // Fetch analytics safely
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getUsersAnalyticsApi();
        console.log('Analytics data:', res);
        if (isMounted && res?.success) {
          // normalize shape defensively
          const us = res.users_stats ?? {};
          setStats({
            users: us.users ?? { number: 0, details: [] },
            active_users: us.active_users ?? { number: 0, details: [] },
            api_users: us.api_users ?? { number: 0, details: [] },
          });
        }
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalUsers = stats?.users?.number ?? 0;
  const activeUsers = stats?.active_users?.number ?? 0;
  const apiUsers = stats?.api_users?.number ?? 0;

  const activeDetails = stats?.active_users?.details ?? [];
  const apiDetails = stats?.api_users?.details ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          System analytics and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={totalUsers} accent="bg-blue-500" />
        <StatCard
          label="Active Users"
          value={activeUsers}
          accent="bg-emerald-500"
        />
        <StatCard label="API Users" value={apiUsers} accent="bg-violet-500" />
      </div>

      {/* Detail Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReusableTable
          title="Recently Active Users"
          data={activeDetails}
          columns={userCols}
          searchable
          filterable={false}
          loading={loading}
          pageSize={5}
          showPagination={activeDetails.length > 5}
          multiSelect={false}
        />

        <ReusableTable
          title="API Users"
          data={apiDetails}
          columns={userCols}
          searchable
          filterable={false}
          loading={loading}
          pageSize={5}
          showPagination={apiDetails.length > 5}
          multiSelect={false}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
