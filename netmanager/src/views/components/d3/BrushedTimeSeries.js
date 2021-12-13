import React, { useRef } from "react";
import d3 from "d3";

// css styles
import "assets/css/d3/brushed-timeseries.css";

const BrushedTimeSeries = ({ data, xFunc, yFunc, symbolFunc, yLabel }) => {
  const ref = useRef();
  const margin = { top: 20, right: 20, bottom: 100, left: 35 };
  const winWidth = 600;
  const winHeight = 370;
  const width = winWidth - margin.left - margin.right;
  const height = winHeight - margin.top - margin.bottom;

  const margin_context = { top: 320, right: 20, bottom: 20, left: 35 };
  const height_context = winHeight - margin_context.top - margin_context.bottom;

  const dataXrange = d3.extent(data, xFunc);
  const dataYrange = [0, d3.max(data, yFunc)];

  /* Scales */
  const x = d3.scaleTime().range([0, width]).domain(dataXrange);

  const y = d3.scaleLinear().range([height, 0]).domain(dataYrange);
  const mindate = dataXrange[0],
    maxdate = dataXrange[1];

  const x2 = d3.scaleTime().range([0, width]).domain([mindate, maxdate]);

  const y2 = d3.scaleLinear().range([height_context, 0]).domain(y.domain());

  /* Axes */
  const xAxis = d3.axisBottom().scale(x).tickSize(-height);

  const yAxis = d3.axisLeft().scale(y).ticks(4).tickSize(-width);

  const xAxisContext = d3.axisBottom().scale(x2);

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
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  context
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height_context})`)
    .call(xAxisContext);

  const line = d3
    .line()
    .x((d) => x(xFunc(d)))
    .y((d) => y(yFunc(d)));

  const lineContext = d3
    .line()
    .x((d) => x2(xFunc(d)))
    .y((d) => y2(yFunc(d)));

  const dataNest = d3.nest().key(symbolFunc).entries(data);

  const color = d3.scaleOrdinal().range(d3.schemeCategory10);

  dataNest.forEach((d, i) => {
    const id = `tag-${d.key
      .replace(/\s+/g, "")
      .replace(",", "")}-${Math.random().toString(16).slice(2)}-${i}`;

    focus
      .append("path")
      .attr("class", "line")
      .style("stroke", () => (d.color = color(d.key)))
      .attr("id", id)
      .attr("d", line(d.values));

    context
      .append("path")
      .attr("class", "line")
      .style("stroke", () => (d.color = color(d.key)))
      .attr("id", `${id}-context`)
      .attr("d", lineContext(d.values));
  });

  const brush = d3.brushX().extent([
    [0, -5],
    [width, height_context],
  ]);

  const brushg = context
    .append("g")
    .attr("class", "x brush")
    .call(brush)
    // .call(brush.move, [15, 100]);
    .call(brush.move, dataXrange.map(x2));

  /* === y axis title === */

  vis
    .append("text")
    .attr("class", "y axis title")
    .text(yLabel)
    .attr("x", -(height / 2))
    .attr("y", 0)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");

  const brushed({selection}) {
    if (selection) {
      console.log("selection", selection)
      svg.property("value", selection.map(x.invert, x).map(d3.utcDay.round));
      svg.dispatch("input");
    }
  }

  function brushended({selection}) {
    if (!selection) {
      // gb.call(brush.move, defaultSelection);
    }
  }

  return (
    <div className="brushed-TS" style={{ border: "1px solid red" }}>
      <svg viewBox={`0 0 ${winWidth} ${winHeight}`} ref={ref} />
    </div>
  );
};

export default BrushedTimeSeries;
