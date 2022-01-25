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
        />
      );
    case "pie":
      return (
        <MultiLevelPieChart
          data={data}
          xFunc={xFunc}
          yFunc={yFunc}
          symbolFunc={symbolFunc}
          yLabel={yLabel}
          freq={freq}
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
        />
      );
  }
};

export default CustomDisplayChart;
