import React, { useRef } from "react";
import d3 from "d3";

// css styles
import "assets/css/d3/brushed-timeseries.css";

const BrushedTimeSeries = ({ data }) => {
  const ref = useRef();
  const margin = { top: 20, right: 20, bottom: 100, left: 30 };
  const winWidth = 600;
  const winHeight = 370;
  const width = winWidth - margin.left - margin.right;
  const height = winHeight - margin.top - margin.bottom;

  const margin_context = { top: 320, right: 20, bottom: 20, left: 30 };
  const height_context = winHeight - margin_context.top - margin_context.bottom;

  const dataXrange = d3.extent(data, function (d) {
    return new Date(d.time);
  });
  const dataYrange = [
    0,
    d3.max(data, function (d) {
      return d.value;
    }),
  ];

  /* Scales */
  const x = d3.scaleTime().range([0, width]).domain(dataXrange);

  const y = d3.scaleLinear().range([height, 0]).domain(dataYrange);
  const mindate = dataXrange[0],
    maxdate = dataXrange[1];

  const x2 = d3.scaleTime().range([0, width]).domain([mindate, maxdate]);

  const y2 = d3.scaleLinear().range([height_context, 0]).domain(y.domain());

  /* Axes */
  const xAxis = d3.axisBottom().scale(x).tickSize(-height);
  // .ticks(customTickFunction)
  // .tickFormat(dynamicDateFormat);

  const yAxis = d3.axisLeft().scale(y).ticks(4).tickSize(-width);

  const xAxisContext = d3.axisBottom().scale(x2);
  // .ticks(customTickFunction)
  // .tickFormat(dynamicDateFormat);

  const vis = d3.select(ref.current).attr("class", "metric-chart");

  const focus = vis
    .append("g")
    .attr("class", "focus")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const context = vis
    .append("g")
    .attr("class", "context")
    .attr(
      "transform",
      `translate(${margin_context.left}, ${margin_context.top})`
    );

  focus.append("g").attr("class", "y axis").call(yAxis);

  focus
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  context
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height_context + ")")
    .call(xAxisContext);

  const line = d3
    .line()
    .x(function (d) {
      return x(new Date(d.time));
    })
    .y(function (d) {
      return y(d.value);
    });

  const lineContext = d3
    .line()
    .x(function (d) {
      return x2(new Date(d.time));
    })
    .y(function (d) {
      return y2(d.value);
    });

  focus.append("path").datum(data).attr("class", "line").attr("d", line);

  context.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", lineContext);

  return (
    <div id="metric-modal" style={{ border: "1px solid red" }}>
      <svg viewBox={`0 0 ${winWidth} ${winHeight}`} ref={ref} />
    </div>
  );
};

export default BrushedTimeSeries;
