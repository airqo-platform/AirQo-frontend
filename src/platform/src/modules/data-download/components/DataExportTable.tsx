import React from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { TabType, TableItem, ColumnConfig } from '../types/dataExportTypes';
import { getTabConfig } from '../utils/tableConfig';

interface DataExportTableProps {
  activeTab: TabType;
  tableData: TableItem[];
  columns: ColumnConfig[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  searchTerm: string;
  selectedItems: string[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (search: string) => void;
  onSelectedItemsChange: (selectedIds: (string | number)[]) => void;
}

/**
 * Table component for displaying sites or devices data
 */
export const DataExportTable: React.FC<DataExportTableProps> = ({
  activeTab,
  tableData,
  columns,
  loading,
  error,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  searchTerm,
  selectedItems,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSelectedItemsChange,
}) => {
  const config = getTabConfig(activeTab);

  return (
    <ServerSideTable
      title={config.title}
      data={tableData}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      multiSelect={activeTab !== 'countries' && activeTab !== 'cities'}
      selectedItems={selectedItems}
      onSelectedItemsChange={onSelectedItemsChange}
      customHeader={undefined}
    />
  );
};
