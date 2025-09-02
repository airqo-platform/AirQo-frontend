'use client';

import CardWrapper from '@/common/components/CardWrapper';
import DataDownload from '../data-download/DataDownload';
import { PageHeader } from '@/common/components/Header';

const DataExportPage = (props) => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Custom Data Downloads"
        subtitle="Select any number of locations across Africa to download comprehensive air quality datasets with flexible date ranges and formats."
      />
      <CardWrapper padding="0px" className="overflow-hidden">
        <DataDownload
          onClose={() => {}}
          sidebarBg="#fff"
          resetOnClose
          {...props}
        />
      </CardWrapper>
    </div>
  );
};

export default DataExportPage;
