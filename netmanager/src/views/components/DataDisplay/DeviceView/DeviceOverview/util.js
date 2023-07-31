import { createBarChartData } from 'utils/charts';

export const createChartData = (rawData, { key, includeBarData }) => {
  const label = [];
  const values = [];
  const created_at = (rawData.length && rawData[0].created_at) || undefined;

  const currentDate = new Date(); // Current date
  const lastSevenDays = new Date(); // Date object for the last 7 days
  lastSevenDays.setDate(currentDate.getDate() - 6); // Subtract 6 days to get the start of the last 7 days

  const lastSevenDaysData = rawData.filter((status) => {
    const statusDate = new Date(status.created_at);
    return statusDate >= lastSevenDays && statusDate <= currentDate;
  });

  lastSevenDaysData.forEach((status) => {
    label.push(status.created_at);
    values.push(status[key]);
  });

  if (includeBarData) {
    const uptimeBarChartData = createBarChartData(lastSevenDaysData, key);
    return {
      line: { label, data: values, created_at },
      bar: {
        label: uptimeBarChartData.label,
        data: uptimeBarChartData.data,
        created_at
      }
    };
  }

  return {
    line: { label, data: values, created_at }
  };
};
