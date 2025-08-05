'use client';

import CardWrapper from '@/common/components/CardWrapper';
import DataDownload from '../data-download/DataDownload';

const DataExportPage = () => {
  return (
    <CardWrapper padding="0px" className="overflow-hidden">
      <DataDownload onClose={() => {}} sidebarBg="#fff" resetOnClose />
    </CardWrapper>
  );
};

export default DataExportPage;
