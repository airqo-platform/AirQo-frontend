import React from "react";
import BrushedTimeSeries from "./BrushedTimeSeries";
import BrushedBarChart from "./BrushedBarChart";
import MultiLevelPieChart from "./MultiLevelPieChart";

const CustomDisplayChart = ({
  chartType,
  loading,
  data,
  xFunc,
  yFunc,
  symbolFunc,
  yLabel,
  freq,
  pieChartValueExtractor,
}) => {
  switch (chartType) {
    case "line":
      return (
        <BrushedTimeSeries
          data={data}
          xFunc={xFunc}
          yFunc={yFunc}
          symbolFunc={symbolFunc}
          yLabel={yLabel}
          loading={loading}
        />
      );
    case "bar":
      return (
        <BrushedBarChart
          data={data}
          xFunc={xFunc}
          yFunc={yFunc}
          symbolFunc={symbolFunc}
          yLabel={yLabel}
          freq={freq}
          loading={loading}
        />
      );
    case "pie":
      return (
        <MultiLevelPieChart
          data={data}
          valueExtractor={pieChartValueExtractor}
          loading={loading}
        />
      );
    default:
      return (
        <BrushedTimeSeries
          data={data}
          xFunc={xFunc}
          yFunc={yFunc}
          symbolFunc={symbolFunc}
          yLabel={yLabel}
          loading={loading}
        />
      );
  }
};

export default CustomDisplayChart;
