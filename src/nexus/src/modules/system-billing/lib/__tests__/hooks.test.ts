import { toPaginationProps } from '../hooks';
import type { BillingListMeta } from '@/shared/types/billing';

const listState = (page = 1, pageSize = 10) => ({
  page,
  pageSize,
  onPageChange: jest.fn(),
  onPageSizeChange: jest.fn(),
});

describe('toPaginationProps', () => {
  it('maps list meta onto ServerSideTable pagination props', () => {
    const meta: BillingListMeta = { total: 42, limit: 10, skip: 0 };
    const props = toPaginationProps(meta, listState(1, 10));

    expect(props.currentPage).toBe(1);
    expect(props.pageSize).toBe(10);
    expect(props.totalItems).toBe(42);
    expect(props.totalPages).toBe(5);
    expect(typeof props.onPageChange).toBe('function');
    expect(typeof props.onPageSizeChange).toBe('function');
  });

  it('honours the server page size when it differs from the local one', () => {
    const meta: BillingListMeta = { total: 25, limit: 25, skip: 0 };
    const props = toPaginationProps(meta, listState(1, 10));

    expect(props.totalPages).toBe(1);
  });

  it('never reports fewer than one page', () => {
    const props = toPaginationProps(
      { total: 0, limit: 10, skip: 0 },
      listState()
    );
    expect(props.totalPages).toBe(1);
    expect(props.totalItems).toBe(0);
  });

  it('tolerates missing meta', () => {
    const props = toPaginationProps(undefined, listState(2, 20));
    expect(props.totalItems).toBe(0);
    expect(props.totalPages).toBe(1);
    expect(props.currentPage).toBe(2);
  });
});
