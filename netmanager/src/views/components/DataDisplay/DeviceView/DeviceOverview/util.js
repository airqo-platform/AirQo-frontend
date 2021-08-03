import { createBarChartData } from "utils/charts";

export const createChartData = (rawData, { key, includeBarData }) => {
  const label = [];
  const values = [];
  const created_at = (rawData.length && rawData[0].created_at) || undefined;
  rawData.map((status) => {
    label.push(status.created_at);
    values.push(parseFloat(status[key]).toFixed(2));
  });

  if (includeBarData) {
    const uptimeBarChartData = createBarChartData(rawData, key);
    return {
      line: { label, data: values, created_at },
      bar: {
        label: uptimeBarChartData.label,
        data: uptimeBarChartData.data,
        created_at,
      },
    };
  }
  return {
    line: { label, data: values },
  };
};
