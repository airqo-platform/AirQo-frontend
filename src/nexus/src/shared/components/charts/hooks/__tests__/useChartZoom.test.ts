import { renderHook, act } from '@testing-library/react';
import { useChartZoom, ZoomRange } from '../useChartZoom';

type Row = Record<string, unknown>;

const buildRows = (count: number, xKey: string, start = 0): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    [xKey]: String(start + i),
    value: i,
  }));

describe('useChartZoom', () => {
  it('zooms in on the center of the current window, halving the span', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn());

    const range = result.current.zoomRange as ZoomRange;
    expect(range).not.toBeNull();
    expect(range.endIndex - range.startIndex + 1).toBe(50);
    expect(result.current.isZoomed).toBe(true);
    expect(result.current.canZoomOut).toBe(true);
  });

  it('zooms back out around the same center and resets at full range', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn());

    act(() => result.current.zoomOut());
    const afterOut = result.current.zoomRange as ZoomRange;
    expect(afterOut.endIndex - afterOut.startIndex + 1).toBe(50);

    act(() => result.current.zoomOut());
    expect(result.current.zoomRange).toBeNull();
    expect(result.current.isZoomed).toBe(false);
  });

  it('never shrinks below the minimum window and disables zoom-in there', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(50, 'time'), 'time')
    );

    for (let i = 0; i < 10; i += 1) {
      act(() => result.current.zoomIn());
    }

    const range = result.current.zoomRange as ZoomRange;
    expect(range.endIndex - range.startIndex + 1).toBe(4);
    expect(result.current.canZoomIn).toBe(false);
  });

  it('clamps the window to the dataset bounds', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    for (let i = 0; i < 10; i += 1) {
      act(() => result.current.zoomIn());
    }

    const range = result.current.zoomRange as ZoomRange;
    expect(range.startIndex).toBeGreaterThanOrEqual(0);
    expect(range.endIndex).toBeLessThanOrEqual(99);
  });

  it('resets the window when the dataset content actually changes', () => {
    const { result, rerender } = renderHook(
      ({ rows }) => useChartZoom(rows, 'time'),
      { initialProps: { rows: buildRows(100, 'time') } }
    );

    act(() => result.current.zoomIn());
    expect(result.current.zoomRange).not.toBeNull();

    // Same length, different content — must not keep the old window.
    rerender({ rows: buildRows(100, 'time', 1000) });
    expect(result.current.zoomRange).toBeNull();
  });

  it('keeps the window when only the array identity changes (unstable parent ref)', () => {
    const rows = buildRows(100, 'time');
    const { result, rerender } = renderHook(
      ({ rows }) => useChartZoom(rows, 'time'),
      { initialProps: { rows } }
    );

    act(() => result.current.zoomIn());
    const before = result.current.zoomRange;

    // Fresh array reference, identical content — zoom must survive.
    rerender({ rows: [...rows] });
    expect(result.current.zoomRange).toEqual(before);
  });

  it('degrades a stale window to full view when the dataset shrinks', () => {
    const { result, rerender } = renderHook(
      ({ rows }) => useChartZoom(rows, 'time'),
      { initialProps: { rows: buildRows(100, 'time') } }
    );

    act(() => result.current.zoomIn());
    expect(result.current.zoomRange).not.toBeNull();

    rerender({ rows: buildRows(5, 'time') });
    expect(result.current.zoomRange).toBeNull();
  });

  it('reset restores the full view', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn());
    act(() => result.current.reset());
    expect(result.current.zoomRange).toBeNull();
    expect(result.current.canZoomIn).toBe(true);
    expect(result.current.canZoomOut).toBe(false);
  });

  it('pans the window by an exact index offset', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn()); // 100 -> centered window 25..74
    expect(result.current.zoomRange).toEqual({ startIndex: 25, endIndex: 74 });

    act(() => result.current.pan(10));
    expect(result.current.zoomRange).toEqual({ startIndex: 35, endIndex: 84 });

    act(() => result.current.pan(-15));
    expect(result.current.zoomRange).toEqual({ startIndex: 20, endIndex: 69 });
  });

  it('clamps panning at both dataset ends', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn()); // span 50, centered window 25..74
    act(() => result.current.pan(-999));
    expect(result.current.zoomRange).toEqual({ startIndex: 0, endIndex: 49 });

    act(() => result.current.pan(999));
    expect(result.current.zoomRange).toEqual({ startIndex: 50, endIndex: 99 });
  });

  it('pan and panToCenter are no-ops while the full dataset is visible', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.pan(20));
    expect(result.current.zoomRange).toBeNull();

    act(() => result.current.panToCenter(50));
    expect(result.current.zoomRange).toBeNull();
  });

  it('panToCenter centers the window on the target index, clamped', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn()); // span 50, window 25..74
    act(() => result.current.panToCenter(75));
    expect(result.current.zoomRange).toEqual({ startIndex: 50, endIndex: 99 });

    act(() => result.current.panToCenter(0));
    expect(result.current.zoomRange).toEqual({ startIndex: 0, endIndex: 49 });
  });

  it('keeps the window span constant while panning', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(100, 'time'), 'time')
    );

    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn()); // span 25
    const before = result.current.zoomRange as ZoomRange;
    const span = before.endIndex - before.startIndex + 1;

    act(() => result.current.pan(7));
    const after = result.current.zoomRange as ZoomRange;
    expect(after.endIndex - after.startIndex + 1).toBe(span);
  });

  it('stays accurate at extreme dataset sizes', () => {
    const { result } = renderHook(() =>
      useChartZoom(buildRows(10_000, 'time'), 'time')
    );

    act(() => result.current.zoomIn()); // span 5000, centered on 4999.5
    act(() => result.current.zoomIn()); // span 2500
    act(() => result.current.zoomIn()); // span 1250
    expect(result.current.zoomRange).toEqual({
      startIndex: 4375,
      endIndex: 5624,
    });

    act(() => result.current.pan(10_000));
    expect(result.current.zoomRange).toEqual({
      startIndex: 10_000 - 1250,
      endIndex: 10_000 - 1,
    });

    act(() => result.current.pan(-10_000));
    expect(result.current.zoomRange).toEqual({
      startIndex: 0,
      endIndex: 1250 - 1,
    });
  });
});
