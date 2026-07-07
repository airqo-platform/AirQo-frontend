'use client';

import DataExportPage from '@/modules/data-download/DataExportPage';

// Note: Since this is a client component, metadata will be handled by the root layout
// We can move this to a server component wrapper if needed

const Page: React.FC = () => {
  return <DataExportPage />;
};

export default Page;
