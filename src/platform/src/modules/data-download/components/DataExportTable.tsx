import React from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { CustomField } from './CustomField';
import {
  TabType,
  DeviceCategory,
  TableItem,
  ColumnConfig,
} from '../types/dataExportTypes';
import { DEVICE_CATEGORY_OPTIONS } from '../constants/dataExportConstants';
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
  deviceCategory: DeviceCategory;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (search: string) => void;
  onSelectedItemsChange: (selectedIds: (string | number)[]) => void;
  onDeviceCategoryChange: (category: string) => void;
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
  deviceCategory,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSelectedItemsChange,
  onDeviceCategoryChange,
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
      multiSelect={true}
      selectedItems={selectedItems}
      onSelectedItemsChange={onSelectedItemsChange}
      customHeader={
        activeTab === 'devices' ? (
          <div className="flex items-center justify-end gap-2">
            <CustomField
              label="Category"
              value={deviceCategory}
              onChange={onDeviceCategoryChange}
              options={
                DEVICE_CATEGORY_OPTIONS as unknown as {
                  value: string;
                  label: string;
                }[]
              }
              placeholder="Select category"
              showLabel={false}
            />
          </div>
        ) : undefined
      }
    />
  );
};
