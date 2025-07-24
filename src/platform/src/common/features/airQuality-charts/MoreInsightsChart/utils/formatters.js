export const formatYAxisTick = (tick) => {
  if (tick >= 1_000_000) return `${(tick / 1_000_000).toFixed(1)}M`;
  if (tick >= 1_000) return `${(tick / 1_000).toFixed(1)}K`;
  if (tick < 1 && tick > -1 && tick !== 0) return tick.toFixed(2);
  return tick;
};
