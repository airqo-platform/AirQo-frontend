'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { LoadingState } from '@/shared/components/ui/loading-state';

export interface DataTableColumn<T> {
  key: string;
  label: React.ReactNode;
  /** default true */
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (item: T) => React.ReactNode;
  /** Secondary sort value annotation shown under the label, e.g. "(µg/m³)" */
  unit?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (item: T) => string;
  /** Controlled sort state */
  sortKey: string | null;
  sortDir: 'asc' | 'desc';
  onSortChange: (key: string) => void;
  /** applied to the overflow-x-auto wrapper */
  className?: string;
  /** Rendered inside the scroll area when data is empty (default: null) */
  emptyState?: React.ReactNode;
  /** Show the loading state in the body area while fetching. The thead stays rendered (no layout jump). */
  loading?: boolean;
  /** Custom loading block; defaults to <LoadingState text="Loading data..." className="min-h-[200px]" /> */
  loadingComponent?: React.ReactNode;
}

function DataTableInner<T>(
  props: DataTableProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  const {
    data,
    columns,
    rowKey,
    sortKey,
    sortDir,
    onSortChange,
    className,
    emptyState,
    loading,
    loadingComponent,
  } = props;

  return (
    <div ref={ref} className={cn('overflow-x-auto', className)}>
      {!loading && data.length === 0 && emptyState}
      <table className="min-w-full text-sm" aria-busy={loading || undefined}>
        <thead>
          <tr>
            {columns.map(column => {
              const isSorted = column.key === sortKey;
              const sortable = column.sortable !== false;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    'sticky top-0 z-10 whitespace-nowrap border-b border-border bg-muted px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    column.headerClassName
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-foreground"
                    >
                      {column.label}
                      {column.unit && (
                        <span className="font-normal normal-case text-muted-foreground/80">
                          ({column.unit})
                        </span>
                      )}
                      <span aria-hidden="true" className="w-3 text-[10px]">
                        {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  ) : (
                    <>
                      {column.label}
                      {column.unit && (
                        <span className="ml-1 font-normal normal-case text-muted-foreground/80">
                          ({column.unit})
                        </span>
                      )}
                    </>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        {loading ? (
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-0 py-0">
                {loadingComponent ?? (
                  <LoadingState
                    text="Loading data..."
                    className="min-h-[200px]"
                  />
                )}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-border">
            {data.map(item => (
              <tr key={rowKey(item)} className="hover:bg-muted/40">
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={cn(
                      'whitespace-nowrap px-5 py-4 text-sm',
                      column.cellClassName
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : String(
                          (item as Record<string, unknown>)[column.key] ?? ''
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

/**
 * A controlled-sort presentational table. Sorting logic stays in the
 * consumer — this component renders the table markup (sticky header,
 * sort indicators, responsive columns) without managing sort state.
 */
export const DataTable = React.forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
