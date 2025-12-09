'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import PageHeading from '@/shared/components/ui/page-heading';
import { useUserStatistics } from '@/shared/hooks/useAdmin';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AqUsers01, AqUsersCheck, AqKey01 } from '@airqo/icons-react';
import { Card } from '@/shared/components/ui/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UserStatisticsUser } from '@/shared/types/api';

const UserStatisticsPage: React.FC = () => {
  const { data, isLoading, error, mutate } = useUserStatistics();

  // State for tabs
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'api'>('all');

  // Pagination and search states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const stats = data?.users_stats;

  // Get current data based on active tab
  const currentData = useMemo(() => {
    if (!stats) return [];
    switch (activeTab) {
      case 'active':
        return stats.active_users.details;
      case 'api':
        return stats.api_users.details;
      default:
        return stats.users.details;
    }
  }, [stats, activeTab]);

  // Filter and paginate data
  const filteredData = useMemo(() => {
    return currentData
      .filter((user: UserStatisticsUser) =>
        `${user.firstName} ${user.lastName} ${user.email} ${user.userName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .map((user: UserStatisticsUser) => ({
        ...user,
        id: user._id,
      }));
  }, [currentData, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        render: (value: unknown, user: UserStatisticsUser) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.firstName?.[0] || '?'}
                {user.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'userName',
        label: 'Username',
        render: (value: unknown, user: UserStatisticsUser) => (
          <div className="text-sm">{user.userName || '--'}</div>
        ),
      },
      {
        key: 'id',
        label: 'User ID',
        render: (value: unknown, user: UserStatisticsUser) => (
          <div className="text-sm font-mono text-muted-foreground">
            {user._id}
          </div>
        ),
      },
    ],
    []
  );

  // Stats cards data
  const statsCards = [
    {
      id: 'all',
      title: 'Total Users',
      count: stats?.users.number || 0,
      icon: AqUsers01,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'active',
      title: 'Active Users',
      count: stats?.active_users.number || 0,
      icon: AqUsersCheck,
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'api',
      title: 'API Users',
      count: stats?.api_users.number || 0,
      icon: AqKey01,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Username', 'User ID'];
    const csvData = currentData.map(user => [
      (user.firstName || '').replace(/"/g, '""'),
      (user.lastName || '').replace(/"/g, '""'),
      (user.email || '').replace(/"/g, '""'),
      (user.userName || '').replace(/"/g, '""'),
      user._id.replace(/"/g, '""'),
    ]);
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-statistics-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('User Statistics Report', 14, 20);
    doc.setFontSize(12);
    doc.text(
      `Category: ${activeTab === 'all' ? 'All Users' : activeTab === 'active' ? 'Active Users' : 'API Users'}`,
      14,
      30
    );
    doc.text(`Total Records: ${currentData.length}`, 14, 35);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    const tableData = currentData.map(user => [
      user.firstName || '',
      user.lastName || '',
      user.email || '',
      user.userName || '',
      user._id,
    ]);
    autoTable(doc, {
      head: [['First Name', 'Last Name', 'Email', 'Username', 'User ID']],
      body: tableData,
      startY: 50,
    });
    doc.save(
      `user-statistics-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <LoadingState
        className="h-[calc(100vh-200px)]"
        text="Loading user statistics..."
      />
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner
          title="Failed to load user statistics"
          message={error?.message || 'An error occurred while loading the data'}
        />
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="User Statistics"
        subtitle="View and analyze user statistics across the platform"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map(card => {
          const Icon = card.icon;
          const isActive = activeTab === card.id;
          return (
            <Card
              key={card.id}
              onClick={() => {
                setActiveTab(card.id as 'all' | 'active' | 'api');
                setPage(1);
                setSearch('');
              }}
              className={`cursor-pointer p-6 transition-all ${
                isActive ? 'border-primary bg-primary/5' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">{card.count}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>
      <ServerSideTable
        columns={columns}
        data={paginatedData}
        title={
          activeTab === 'all'
            ? 'All Users'
            : activeTab === 'active'
              ? 'Active Users'
              : 'API Users'
        }
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={setPage}
        onPageSizeChange={newSize => {
          setPageSize(newSize);
          setPage(1);
        }}
        searchTerm={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
        }}
        loading={isLoading}
      />
    </div>
  );
};

// Wrap with permission guard
const ProtectedUserStatisticsPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['ANALYTICS_VIEW', 'ANALYTICS_EXPORT']}
      requiredRoles={['AIRQO_SUPER_ADMIN']}
      accessDeniedTitle="Access Denied"
      accessDeniedMessage="You need both ANALYTICS_VIEW and ANALYTICS_EXPORT permissions, and the AIRQO_SUPER_ADMIN role, to view user statistics."
    >
      <UserStatisticsPage />
    </PermissionGuard>
  );
};

export default ProtectedUserStatisticsPage;
