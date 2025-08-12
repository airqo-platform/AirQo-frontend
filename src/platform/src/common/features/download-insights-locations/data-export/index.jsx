'use client';

import CardWrapper from '@/common/components/CardWrapper';
import DataDownload from '../data-download/DataDownload';

const DataExportPage = (props) => {
  return (
    <CardWrapper padding="0px" className="overflow-hidden">
      <DataDownload
        onClose={() => {}}
        sidebarBg="#fff"
        resetOnClose
        {...props}
      />
    </CardWrapper>
  );
};

export default DataExportPage;
