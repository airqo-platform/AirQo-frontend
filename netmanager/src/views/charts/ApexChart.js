import React from "react";
import Chart from "react-apexcharts";
import ChartContainer from "./ChartContainer";

const ApexChart = ({ className, title, lastUpdated, ...chartProps }) => {
  return (
    <ChartContainer
      className={className}
      title={title}
      lastUpdated={lastUpdated}
    >
      <Chart {...chartProps} />
    </ChartContainer>
  );
};

export default ApexChart;
