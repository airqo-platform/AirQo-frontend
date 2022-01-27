import React, { useEffect, useRef } from "react";
import d3 from "d3";

// css styles
import "assets/css/d3/brushed-timeseries.css";

const PM_COLOR_CATEGORY = [
  { label: "Good", color: "#45e50d" },
  { label: "Moderate", color: "#f8fe28" },
  { label: "UHFSG", color: "#ee8310" },
  { label: "Unhealthy", color: "#fe0000" },
  { label: "VeryUnhealthy", color: "#8639c0" },
  { label: "Hazardous", color: "#81202e" },
  { label: "Others", color: "#808080" },
];

const MultiLevelPieChart = ({
  data,
  xFunc,
  yFunc,
  symbolFunc,
  yLabel,
  freq,
}) => {
  const ref = useRef();
  const focusRef = useRef();
  const margin = { top: 10, right: 20, bottom: 10, left: 20 };
  const winWidth = 650;
  const winHeight = 370;
  const width = winWidth - margin.left - margin.right;
  const height = winHeight - margin.top - margin.bottom;

  const legendWidth = 120;

  const maxRadius = Math.min(width, height) / 2;

  const stepRadius = maxRadius / ((data || []).length > 0 ? data.length : 1);

  let tooltip = d3.select("#d3-tooltip");

  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("id", "d3-tooltip");
  }

  const pie = d3
    .pie()
    .sort(null)
    .value((data) => data.value);

  const removeTooltip = () => {
    if (tooltip) tooltip.style("display", "none");
  };

  const drawTooltip = (event) => {
    const d = event.target.__data__;

    // Rounded to 2 decimal places
    const percentage =
      Math.round((((d.endAngle - d.startAngle) * 50) / Math.PI) * 100) / 100;

    let h =
      `<div style="font-size: 0.9rem;margin-bottom: 10px;display: flex">${d.data.name}</div>` +
      `<div style="font-size: 0.8rem"><span style="font-weight: bold; text-transform: uppercase">AQI:</span> <div style="display: inline-block; width: 10px; height: 10px; background-color: ${d.data.color}; margin-right: 5px"></div><span>${d.data.category}</span></div>` +
      `<div style="font-size: 0.8rem"><span style="font-weight: bold; text-transform: uppercase">count:</span> <span>${d.data.value}</span></div>` +
      `<div style="font-size: 0.8rem"><span style="font-weight: bold; text-transform: uppercase">percentage:</span> <span>${percentage}%</span></div>`;

    tooltip
      .html(h)
      .style("left", `${event.pageX + 20}px`)
      .style("top", `${event.pageY}px`)
      .style("display", "block");
  };

  const drawPieChart = (index, svg, data) => {
    const angles = pie(data);

    const pieFocus = svg
      .append("g")
      .attr("class", "pie")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${width / 2.5}, ${height / 2})`);

    const paths = pieFocus.selectAll("path").data(angles);

    const arcPath = d3
      .arc()
      .innerRadius(index * stepRadius)
      .outerRadius((index + 1) * stepRadius);

    paths
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("fill", (d) => d.data.color)
      .attr("d", arcPath)
      .on("mousemove", drawTooltip)
      .on("mouseout", removeTooltip);
  };

  useEffect(() => {
    const focus = d3
      .select(ref.current)
      .attr("class", "focus")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Clear chart
    focus.html("");

    const legendSpace = height / 2 / PM_COLOR_CATEGORY.length;

    PM_COLOR_CATEGORY.map((d, i) => {
      focus
        .append("rect")
        .attr("x", width - legendWidth)
        .attr("y", legendSpace / 2 + i * legendSpace - 10)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", () => d.color)
        .text(d.label);

      focus
        .append("text")
        .attr("x", width - legendWidth + 12) // space legend
        .attr("y", legendSpace / 2 + i * legendSpace)
        .attr("class", "legend-pie") // style the legend
        .style("fill", () => "#808080")
        .text(d.label);
    });

    data.map((d, index) => {
      drawPieChart(index, focus, d);
    });
  }, [data, yLabel]);

  return (
    <div className="brushed-TS">
      <svg
        viewBox={`0 0 ${winWidth} ${winHeight}`}
        ref={ref}
        className="metric-chart"
      >
        <g ref={focusRef} />
      </svg>
    </div>
  );
};

export default MultiLevelPieChart;
