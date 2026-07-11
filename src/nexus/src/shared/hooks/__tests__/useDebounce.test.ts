import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedSearch } from '../useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });
    expect(result.current).toBe('hello');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('hello', 500));

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    const calledId = clearTimeoutSpy.mock.calls[0][0];
    expect(calledId).toBeDefined();
    expect(typeof calledId).toBe('number');
  });

  it('multiple rapid changes only apply last value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    rerender({ value: 'third' });
    rerender({ value: 'fourth' });

    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('fourth');
  });

  it('works with non-string types (number)', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 1, delay: 200 } }
    );

    rerender({ value: 42, delay: 200 });
    expect(result.current).toBe(1);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(42);
  });
});

describe('useDebouncedSearch', () => {
  it('returns initial searchValue and debouncedSearchValue', () => {
    const { result } = renderHook(() => useDebouncedSearch('', 300));
    expect(result.current.searchValue).toBe('');
    expect(result.current.debouncedSearchValue).toBe('');
  });

  it('isSearching is false initially', () => {
    const { result } = renderHook(() => useDebouncedSearch('', 300));
    expect(result.current.isSearching).toBe(false);
  });

  it('sets isSearching true when searchValue changes before debounce', () => {
    const { result } = renderHook(() => useDebouncedSearch('', 300));

    act(() => {
      result.current.setSearchValue('test');
    });

    expect(result.current.isSearching).toBe(true);
    expect(result.current.searchValue).toBe('test');
    expect(result.current.debouncedSearchValue).toBe('');
  });

  it('sets isSearching false after debounce completes', () => {
    const { result } = renderHook(() => useDebouncedSearch('', 300));

    act(() => {
      result.current.setSearchValue('test');
    });

    expect(result.current.isSearching).toBe(true);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.debouncedSearchValue).toBe('test');
  });

  it('multiple rapid searches: only last value debounced', () => {
    const { result } = renderHook(() => useDebouncedSearch('', 300));

    act(() => {
      result.current.setSearchValue('a');
    });
    act(() => {
      result.current.setSearchValue('ab');
    });
    act(() => {
      result.current.setSearchValue('abc');
    });

    expect(result.current.searchValue).toBe('abc');
    expect(result.current.debouncedSearchValue).toBe('');
    expect(result.current.isSearching).toBe(true);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearchValue).toBe('abc');
    expect(result.current.isSearching).toBe(false);
  });
});
