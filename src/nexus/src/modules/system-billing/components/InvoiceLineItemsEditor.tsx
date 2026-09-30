'use client';

import React, { useCallback, useRef } from 'react';
import { Input, TextInput } from '@/shared/components/ui';
import { AqPlus, AqTrash01 } from '@airqo/icons-react';
import type { BillingLineItem } from '@/shared/types/billing';

interface LineRow extends BillingLineItem {
  id: string;
}

interface InvoiceLineItemsEditorProps {
  value: BillingLineItem[];
  onChange: (items: BillingLineItem[]) => void;
  disabled?: boolean;
}

const newRow = (): LineRow => ({
  id: Math.random().toString(36).substring(2, 9),
  item: '',
  description: '',
  quantity: 1,
  unit_price: 0,
});

const stripInternalId = (row: LineRow): BillingLineItem => ({
  item: row.item,
  description: row.description,
  quantity: row.quantity,
  unit_price: row.unit_price,
});

const NUMERIC_REGEX = /^\d*\.?\d{0,2}$/;

const parseNumeric = (value: string): number => {
  if (value === '' || value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.round(num * 100) / 100) : 0;
};

const InvoiceLineItemsEditor: React.FC<InvoiceLineItemsEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const items = value ?? [];

  // Row ids live in a ref that runs alongside `value`: a fresh id per render
  // would change the React key and remount the row, dropping input focus as
  // soon as the first character is typed into a new row.
  const idsRef = useRef<string[]>([]);
  if (idsRef.current.length < items.length) {
    const missing = items.length - idsRef.current.length;
    idsRef.current = [
      ...idsRef.current,
      ...Array.from({ length: missing }, () => newRow().id),
    ];
  }
  idsRef.current.length = items.length;

  const rows: LineRow[] = items.map((item, idx) => ({
    ...item,
    id: idsRef.current[idx],
  }));

  const emit = useCallback(
    (next: LineRow[]) => {
      onChange(next.map(stripInternalId));
    },
    [onChange]
  );

  const updateRow = useCallback(
    (id: string, patch: Partial<LineRow>) => {
      emit(rows.map(row => (row.id === id ? { ...row, ...patch } : row)));
    },
    [rows, emit]
  );

  const handleAdd = useCallback(() => {
    const row = newRow();
    idsRef.current = [...idsRef.current, row.id];
    emit([...rows, row]);
  }, [rows, emit]);

  const handleRemove = useCallback(
    (id: string) => {
      idsRef.current = idsRef.current.filter(existing => existing !== id);
      emit(rows.filter(row => row.id !== id));
    },
    [rows, emit]
  );

  const handleNumeric = (
    id: string,
    field: 'quantity' | 'unit_price',
    raw: string
  ) => {
    if (raw === '' || NUMERIC_REGEX.test(raw)) {
      updateRow(id, { [field]: parseNumeric(raw) });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Line items</h3>
        <p className="text-xs text-muted-foreground">
          Amounts are calculated as quantity × unit price.
        </p>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No line items yet. Add one below.
        </p>
      )}

      {/* Desktop grid header (hidden on mobile) */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-2 px-1">
        <span className="col-span-2 text-xs font-medium text-muted-foreground">
          Item code
        </span>
        <span className="col-span-4 text-xs font-medium text-muted-foreground">
          Description
        </span>
        <span className="col-span-2 text-xs font-medium text-muted-foreground">
          Quantity
        </span>
        <span className="col-span-2 text-xs font-medium text-muted-foreground">
          Unit price
        </span>
        <span className="col-span-1 text-xs font-medium text-muted-foreground text-right">
          Amount
        </span>
        <span className="col-span-1" />
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => {
          const amount = (row.quantity ?? 0) * (row.unit_price ?? 0);
          return (
            <div
              key={row.id}
              className="md:grid md:grid-cols-12 md:gap-2 md:items-start space-y-2 md:space-y-0 p-3 md:p-0 rounded-lg md:rounded-none border md:border-0 border-border/60 bg-card/40 md:bg-transparent"
            >
              <div className="md:col-span-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">
                  Item code
                </span>
                <Input
                  aria-label={`Line item ${index + 1} code`}
                  placeholder="SKU-001"
                  value={row.item ?? ''}
                  onChange={e => updateRow(row.id, { item: e.target.value })}
                  disabled={disabled}
                  containerClassName="mb-0"
                />
              </div>
              <div className="md:col-span-4">
                <span className="md:hidden text-xs font-medium text-muted-foreground">
                  Description
                </span>
                <TextInput
                  aria-label={`Line item ${index + 1} description`}
                  placeholder="Consulting services"
                  value={row.description ?? ''}
                  onChange={e =>
                    updateRow(row.id, { description: e.target.value })
                  }
                  disabled={disabled}
                  containerClassName="mb-0"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">
                  Quantity
                </span>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  aria-label={`Line item ${index + 1} quantity`}
                  placeholder="1"
                  value={row.quantity ?? 0}
                  onChange={e =>
                    handleNumeric(row.id, 'quantity', e.target.value)
                  }
                  disabled={disabled}
                  containerClassName="mb-0"
                />
              </div>
              <div className="md:col-span-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">
                  Unit price
                </span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  aria-label={`Line item ${index + 1} unit price`}
                  placeholder="0.00"
                  value={row.unit_price ?? 0}
                  onChange={e =>
                    handleNumeric(row.id, 'unit_price', e.target.value)
                  }
                  disabled={disabled}
                  containerClassName="mb-0"
                />
              </div>
              <div className="md:col-span-1 flex items-center justify-end">
                <span className="md:hidden text-xs font-medium text-muted-foreground mr-2">
                  Amount:
                </span>
                <span className="text-sm tabular-nums text-foreground font-medium">
                  {amount.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemove(row.id)}
                  disabled={disabled}
                  className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                  aria-label={`Remove line item ${index + 1}`}
                >
                  <AqTrash01 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <AqPlus className="w-4 h-4" />
        Add line item
      </button>
    </div>
  );
};

export default InvoiceLineItemsEditor;
