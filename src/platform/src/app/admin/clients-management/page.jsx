'use client';

import AdminClientsTable from '@/common/features/user-settings/components/API/AdminClientsTable';

const page = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Clients Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your clients effectively
        </p>
      </div>
      <AdminClientsTable />
    </div>
  );
};

export default page;
