import React, { useEffect, useState, useRef } from "react";
import d3 from "d3";

// css styles
import "assets/css/d3/brushed-timeseries.css";

/**
 * Hook, that returns the last used value.
 */

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const BrushChart = ({
  data,
  selection,
  width,
  height,
  margin,
  xFunc,
  yFunc,
  symbolFunc,
}) => {
  const ref = useRef();
  // console.log("test data", data);

  useEffect(() => {
    const dataYrange = [0, d3.max(data, yFunc)];
    const dataXrange = d3.extent(data, xFunc);

    const x = d3
      .scaleTime()
      .range([0, width])
      .domain(selection || dataXrange);
    // .domain(dataXrange);
    const y = d3.scaleLinear().range([height, 0]).domain(dataYrange);

    const xAxis = d3.axisBottom().scale(x).tickSize(-height);
    const yAxis = d3.axisLeft().scale(y).ticks(4).tickSize(-width);

    const focus = d3
      .select(ref.current)
      // .append("g")
      .attr("class", "focus")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Clear chart
    focus.html("");

    focus.append("g").attr("class", "y axis").call(yAxis);

    focus
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    const line = d3
      .line()
      .x((d) => x(xFunc(d)))
      .y((d) => y(yFunc(d)));

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
    });
  }, [data, selection]);

  return <g ref={ref} />;
};

const BrushedTimeSeries = ({ data, xFunc, yFunc, symbolFunc, yLabel }) => {
  const ref = useRef();
  const margin = { top: 20, right: 20, bottom: 100, left: 35 };
  const winWidth = 650;
  const winHeight = 370;
  const width = winWidth - margin.left - margin.right;
  const height = winHeight - margin.top - margin.bottom;

  const margin_context = { top: 320, right: 20, bottom: 20, left: 35 };
  const height_context = winHeight - margin_context.top - margin_context.bottom;
  const [selection, setSelection] = useState(null);
  const previousSelection = usePrevious(selection);

  useEffect(() => {
    const dataXrange = d3.extent(data, xFunc);
    const dataYrange = [0, d3.max(data, yFunc)];

    const x2 = d3.scaleTime().range([0, width]).domain(dataXrange);

    const y2 = d3.scaleLinear().range([height_context, 0]).domain(dataYrange);

    const xAxisContext = d3.axisBottom().scale(x2);

    const vis = d3.select(ref.current).attr("class", "metric-chart");

    vis
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const context = vis
      .append("g")
      .attr("class", "context")
      .attr(
        "transform",
        `translate(${margin_context.left}, ${margin_context.top})`
      );

    context
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height_context})`)
      .call(xAxisContext);

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

      context
        .append("path")
        .attr("class", "line")
        .style("stroke", () => (d.color = color(d.key)))
        .attr("id", `${id}-context`)
        .attr("d", lineContext(d.values));
    });

    const brush = d3
      .brushX()
      .extent([
        [0, -5],
        [width, height_context],
      ])
      // .on("brush", brushed(x2))
      .on("end", ({ selection }) => {
        console.log("selection end", selection);
        console.log("selection bool", !!selection);
        if (!selection || selection.includes(NaN)) {
          setSelection(dataXrange);
          return;
        }
        setSelection(selection.map(x2.invert));
      });
    console.log("s", selection);
    console.log("range x", dataXrange);
    console.log("range x in verted", dataXrange.map(x2));
    if (previousSelection === selection) {
      const brushg = context
        .append("g")
        .attr("class", "x brush")
        .call(brush)
        .call(
          brush.move,
          (selection && selection.map(x2)) || dataXrange.map(x2)
        );
      /* === y axis title === */
    }
    vis
      .append("text")
      .attr("class", "y axis title")
      .text(yLabel)
      .attr("x", -(height / 2))
      .attr("y", 0)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle");
  }, [data, selection, previousSelection]);

  const brushed = (s) => ({ selection }) => {
    console.log("ended");
    if (selection) {
      const indexSelection = selection.map(s.invert);
      setSelection(indexSelection);
      console.log("selection", indexSelection);
      // svg.property("value", selection.map(x.invert, x).map(d3.utcDay.round));
      // svg.dispatch("input");
    }
  };

  function brushended({ selection }) {
    console.log(selection);
    if (!selection) {
      // gb.call(brush.move, defaultSelection);
    }
  }

  return (
    // <div className="brushed-TS" style={{ border: "1px solid red" }}>
    <div className="brushed-TS" style={{ border: "1px solid red" }}>
      <svg viewBox={`0 0 ${winWidth} ${winHeight}`} ref={ref}>
        <BrushChart
          data={data}
          selection={selection}
          width={width}
          height={height}
          margin={margin}
          xFunc={xFunc}
          yFunc={yFunc}
          symbolFunc={symbolFunc}
        />
      </svg>
    </div>
  );
};

export default BrushedTimeSeries;
