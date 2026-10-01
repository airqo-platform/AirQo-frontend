import { renderHook } from '@testing-library/react';

let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

import { useHomeStart } from '../useHomeStart';

describe('useHomeStart', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  it('returns the homeStart value when the param is present', () => {
    mockSearchParams = new URLSearchParams(
      'view=comparison&homeStart=compare-places'
    );

    const { result } = renderHook(() => useHomeStart());

    expect(result.current).toBe('compare-places');
  });

  it('returns null when homeStart is absent', () => {
    mockSearchParams = new URLSearchParams('view=comparison');

    const { result } = renderHook(() => useHomeStart());

    expect(result.current).toBeNull();
  });

  it('returns null when the search string is empty', () => {
    const { result } = renderHook(() => useHomeStart());

    expect(result.current).toBeNull();
  });
});
