import React from "react";
import Chart from "react-apexcharts";
import ChartContainer from "./ChartContainer";

const ApexChart = ({ className, title, lastUpdated, blue, green, ...chartProps }) => {
  const modifiedChartProps = { ...chartProps, width: "100%", height: "100%" };
  return (
    <ChartContainer
      className={className}
      title={title}
      lastUpdated={lastUpdated}
      blue={blue}
      green={green}
    >
      <Chart {...modifiedChartProps} />
    </ChartContainer>
  );
};

export default ApexChart;
