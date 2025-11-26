import { useMemo } from 'react';

export default function useChartTicks(chartData, containerWidth) {
  const tickCount = useMemo(() => {
    if (containerWidth < 480) return 4;
    if (containerWidth < 768) return 6;
    if (containerWidth < 1024) return 8;
    return 12;
  }, [containerWidth]);

  const xTicks = useMemo(() => {
    if (!chartData.length) return [];

    const step = Math.max(1, Math.ceil(chartData.length / tickCount));
    const ticks = [];

    for (let i = 0; i < chartData.length; i += step)
      ticks.push(chartData[i].time);

    const last = chartData[chartData.length - 1].time;
    if (ticks[ticks.length - 1] !== last) ticks.push(last);

    return ticks;
  }, [chartData, tickCount]);

  return xTicks;
}
