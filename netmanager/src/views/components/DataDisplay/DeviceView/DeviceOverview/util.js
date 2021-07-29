import { createBarChartData } from "utils/charts";

export const createChartData = (rawData, { key, includeBarData }) => {
  const label = [];
  const values = [];
  rawData.map((status) => {
    label.push(status.created_at);
    values.push(parseFloat(status[key]).toFixed(2));
  });

  if (includeBarData) {
    const uptimeBarChartData = createBarChartData(rawData, key);
    return {
      line: { label, data: values },
      bar: { label: uptimeBarChartData.label, data: uptimeBarChartData.data },
    };
  }
  return {
    line: { label, data: values },
  };
};
