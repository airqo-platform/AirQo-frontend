'use client';

import AdminClientsTable from '@/common/features/user-settings/components/API/AdminClientsTable';
import { PageHeader } from '@/common/components/Header';

const page = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        isLoading={false}
        title="Clients Management"
        subtitle="Manage your clients effectively"
      />
      <AdminClientsTable />
    </div>
  );
};

export default page;
