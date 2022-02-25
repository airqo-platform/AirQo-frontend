import React, { useRef } from "react";
import { isEmpty } from "underscore";
import d3 from "d3";

// css styles
import "assets/css/d3/timeseries.css";

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 500;
const DEFAULT_MARGIN = { top: 20, right: 30, bottom: 65, left: 90 };

const TimeSeriesChart = ({ width, height, margin, data }) => {
  const ref = useRef();
  const width_ = width || DEFAULT_WIDTH;
  const height_ = height || DEFAULT_HEIGHT;
  const margin_ = margin || DEFAULT_MARGIN;

  const innerHeight = height_ - margin_.top - margin_.bottom;
  const innerWidth = width_ - margin_.left - margin_.right;

  const svg = d3
    .select(ref.current)
    .append("g")
    .attr("transform", `translate(${margin_.left}, ${margin_.top})`);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.time)))
    .range([0, innerWidth]);

  const xAxis = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + innerHeight + ")")
    // .attr("transform", `translate(${margin_.left}, ${margin_.top})`)
    .call(d3.axisBottom(xScale));

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.value))
    // .domain([0, 100])
    // .domain([22.8, 69.45])
    .range([innerHeight, 0])
    .nice();
  const yAxis = svg
    .append("g")
    .attr("class", "y axis")
    // .attr("transform", `translate(${margin_.left}, ${margin_.top})`)
    .call(d3.axisLeft(yScale));

  const dataNest = d3
    .nest()
    .key((d) => d.name)
    .entries(data);

  const color = d3.scaleOrdinal().range(d3.schemeCategory10);

  const legendSpace = innerWidth / dataNest.length;

  // Define the line
  const priceline = d3
    .line()
    // .curve(d3.curveLinearClosed)
    // .curve(d3.curveBasis)
    .curve(d3.curveCatmullRom)
    // .curve(d3.curveMonotoneX)
    .x((d) => xScale(new Date(d.time)))
    .y((d) => yScale(d.value));

  dataNest.forEach((d, i) => {
    const id = `tag-${Math.random()
      .toString(16)
      .slice(2)}-${Math.random().toString(16).slice(2)}-${i}`;

    svg
      .append("path")
      .attr("class", "timeseries-path line")
      .style("stroke", () => (d.color = color(d.key)))
      .attr("id", id) // assign ID
      .attr("d", priceline(d.values));

    // Add the Legend
    svg
      .append("text")
      .attr("x", legendSpace / 2 + i * legendSpace) // space legend
      .attr("y", innerHeight + margin_.bottom / 2 + 5)
      .attr("class", "legend") // style the legend
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

        d3.select(`#${id}`)
          .transition()
          .duration(100)
          .style("opacity", newOpacity);

        // Update whether or not the elements are active
        d.active = !active;
      })
      .text(d.key);
  });

  return (
    <svg
      width={width_}
      height={height_}
      ref={ref}
      style={{ border: "1px solid red" }}
    />
  );
};

export default TimeSeriesChart;
