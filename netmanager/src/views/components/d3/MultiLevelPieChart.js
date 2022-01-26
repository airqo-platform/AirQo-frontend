import React, { useEffect, useState, useRef } from "react";
import d3 from "d3";

// css styles
import "assets/css/d3/brushed-timeseries.css";

const ONE_HOUR = 1000 * 60 * 60;
const SIX_HOURS = 6 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;

function checkIfDateClose(maxDiff, date1, date2) {
  return Math.abs(date1 - date2) <= maxDiff;
}

const timeMapper = {
  hourly: d3.timeHour,
  daily: d3.timeDay,
  monthly: d3.timeMonth,
};

const createDomain = (freq, domain) => {
  const timeFunc = timeMapper[freq] || d3.timeHour;
  const modifiedDomain = [domain[0], timeFunc.offset(domain[1], 1)];
  return timeFunc.range(...modifiedDomain);
};

const PM_COLOR_CATEGORY = [
  { label: "Good", color: "#45e50d" },
  { label: "Moderate", color: "#f8fe28" },
  { label: "UHFSG", color: "#ee8310" },
  { label: "Unhealthy", color: "#fe0000" },
  { label: "VeryUnhealthy", color: "#8639c0" },
  { label: "Hazardous", color: "#81202e" },
  { label: "Others", color: "#808080" },
];

const BrushChart = ({
  data,
  selection,
  width,
  height,
  margin,
  xFunc,
  yFunc,
  symbolFunc,
  freq,
  color,
}) => {
  const ref = useRef();

  useEffect(() => {
    const dataYrange = [0, d3.max(data, yFunc)];
    const dataXrange = d3.extent(data, xFunc);

    const x = d3
      .scaleTime()
      .range([0, width])
      .domain(selection || dataXrange);

    const y = d3.scaleLinear().range([height, 0]).domain(dataYrange);

    const xBand = d3.scaleBand().range([0, width]).padding(0.1);

    if (dataXrange.length > 1) xBand.domain(createDomain(freq, x.domain()));

    const xAxis = d3.axisBottom().scale(x).ticks(5).tickSize(-height);
    const yAxis = d3.axisLeft().scale(y).ticks(4).tickSize(-width);

    const focus = d3
      .select(ref.current)
      .attr("class", "focus")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Clear chart
    focus.html("");

    let tooltip = d3.select("#d3-tooltip");

    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("id", "d3-tooltip");
    }

    const tooltipLine = focus.append("line");

    focus.append("g").attr("class", "y axis").call(yAxis);

    focus
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    const dataNest = d3.nest().key(symbolFunc).entries(data);

    const legendSpace = width / dataNest.length;

    dataNest.forEach((d, i) => {
      const id = `tag-${d.key
        .replace(/\s+/g, "")
        .replace(",", "")}-${Math.random().toString(16).slice(2)}-${i}`;
      focus
        .selectAll("rect")
        .data(
          d.values.filter(
            (d) =>
              xFunc(d) >= (selection || dataXrange)[0] &&
              xFunc(d) <= (selection || dataXrange)[1]
          )
        )

        .enter()
        .append("rect")
        .attr("class", id)
        .attr("width", xBand.bandwidth())
        .attr("x", (d) => xBand(xFunc(d)))
        .style("fill", function () {
          return color(d.key);
        })
        .attr("y", (d) => y(yFunc(d)))
        .attr("height", (d) => y(0) - y(yFunc(d)));

      // Add the Legend
      focus
        .append("text")
        .attr("x", legendSpace / 2 + i * legendSpace) // space legend
        .attr("y", -margin.top / 2)
        .attr("class", "legend") // style the legend
        .attr("id", `${id}-legend`)
        .style("fill", () => {
          // mark path as active
          d.active = true;
          // Add the colours dynamically
          return (d.color = color(d.key));
        })
        .style("cursor", "pointer")
        .on("click", function () {
          // Determine if current line is visible
          const active = !!d.active;
          const newOpacity = active ? 0 : 1;

          const legendOpacity = active ? 0.45 : 1;

          d3.selectAll(`.${id}`)
            .transition()
            .duration(100)
            .style("opacity", newOpacity);

          d3.select(`#${id}-legend`)
            .transition()
            .duration(100)
            .style("opacity", legendOpacity);

          // Update whether or not the elements are active
          d.active = !active;
        })
        .text(d.key);
    });

    const tipBox = focus
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("opacity", 0)
      .on("mousemove", drawTooltip)
      .on("mouseout", removeTooltip);

    function removeTooltip() {
      if (tooltip) tooltip.style("display", "none");
      if (tooltipLine) tooltipLine.attr("stroke", "none");
    }

    function drawTooltip(event) {
      const date = x.invert(d3.pointer(event)[0]);
      const bisect = d3.bisector(function (d) {
        return new Date(d.time);
      }).left;

      const sortingObj = [];

      dataNest.map((d) => {
        const idx = bisect(d.values, date);
        d.active &&
          d.values[idx] &&
          checkIfDateClose(ONE_DAY, date, new Date(d.values[idx].time)) &&
          sortingObj.push(d.values[idx]);
      });

      const lineDate = sortingObj.length > 0 && new Date(sortingObj[0].time);

      const formatTime = d3.timeFormat("%d-%m-%Y %I:%M%p");

      tooltipLine
        .attr("stroke", "#bec4c8")
        .attr("stroke-dasharray", "4")
        .attr("x1", x(lineDate))
        .attr("x2", x(lineDate))
        .attr("y1", 0)
        .attr("y2", height);

      let h = `<div style="font-size: 0.9rem;margin-bottom: 10px;display: flex">${formatTime(
        lineDate
      )}</div>`;
      sortingObj.map((d) => {
        h += `<div style="font-size: 0.8rem"><span style="color: ${color(
          d.name
        )}">${d.name}</span> - ${d.value}</div>`;
      });

      if (lineDate) {
        tooltip
          .html(h)
          .style("left", `${event.pageX + 30}px`)
          .style("top", `${event.pageY + 30}px`)
          .style("display", "block");
      } else {
        tooltip.style("display", "none");
      }
    }
  }, [data, selection]);

  return <g ref={ref} />;
};

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

  const pie = d3
    .pie()
    .sort(null)
    .value((data) => data.value);

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
      .attr("d", arcPath);
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
