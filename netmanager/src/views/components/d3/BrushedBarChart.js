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
  loading,
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

    if (loading) {
      focus
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .style("font-size", "1.2rem")
        .attr("text-anchor", "middle")
        .text("loading...");
      return;
    }

    if (data.length <= 0) {
      focus
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .style("font-size", "1.2rem")
        .attr("text-anchor", "middle")
        .text("No data");
      return;
    }

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

const BrushedBarChart = ({
  data,
  xFunc,
  yFunc,
  symbolFunc,
  yLabel,
  freq,
  loading,
}) => {
  const ref = useRef();
  const contextRef = useRef();
  const margin = { top: 20, right: 20, bottom: 100, left: 35 };
  const winWidth = 650;
  const winHeight = 370;
  const width = winWidth - margin.left - margin.right;
  const height = winHeight - margin.top - margin.bottom;

  const margin_context = { top: 320, right: 20, bottom: 20, left: 35 };
  const height_context = winHeight - margin_context.top - margin_context.bottom;

  const color = d3.scaleOrdinal().range(d3.schemeCategory10);

  const [selection, setSelection] = useState(null);

  useEffect(() => {
    const dataXrange = d3.extent(data, xFunc);
    const dataYrange = [0, d3.max(data, yFunc)];

    const xContext = d3.scaleTime().range([0, width]).domain(dataXrange);

    const yContext = d3
      .scaleLinear()
      .range([height_context, 0])
      .domain(dataYrange);

    const xContextBand = d3.scaleBand().range([0, width]).padding(0.1);

    if (dataXrange.length > 1)
      xContextBand.domain(createDomain(freq, xContext.domain()));

    const xAxisContext = d3.axisBottom().scale(xContext).ticks(5);

    const vis = d3.select(ref.current).attr("class", "metric-chart");

    vis
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // const context = vis
    const context = d3
      .select(contextRef.current)
      .attr("class", "context")
      .attr(
        "transform",
        `translate(${margin_context.left}, ${margin_context.top})`
      );

    // Clear chart
    context.html("");

    if (loading) {
      context
        .append("text")
        .attr("x", width / 2)
        .attr("y", height_context / 2)
        .attr("text-anchor", "middle")
        .text("loading...");
      return;
    }

    if (data.length <= 0) {
      context
        .append("text")
        .attr("x", width / 2)
        .attr("y", height_context / 2)
        .attr("text-anchor", "middle")
        .text("No data");
      return;
    }

    context
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height_context})`)
      .call(xAxisContext);

    const dataNest = d3.nest().key(symbolFunc).entries(data);

    dataNest.forEach((d) => {
      context
        .selectAll("rect")
        .data(d.values)
        .enter()
        .append("rect")
        .attr("width", xContextBand.bandwidth())
        .attr("x", (d) => xContextBand(xFunc(d)))
        .style("fill", function () {
          return color(d.key);
        })
        .attr("y", (d) => yContext(yFunc(d)))
        .attr("height", (d) => yContext(0) - yContext(yFunc(d)));
    });

    const brush = d3
      .brushX()
      .extent([
        [0, -8],
        [width, height_context + 5],
      ])
      // .on("brush", brushed(x2))
      .on("end", ({ selection }) => {
        if (!selection || selection.includes(NaN)) {
          setSelection(dataXrange);
          return;
        }
        setSelection(selection.map(xContext.invert));
      });
    const brushg = context.append("g").attr("class", "x brush").call(brush);

    if (dataXrange[0] !== undefined && dataXrange[1] !== undefined) {
      brushg.call(brush.move, dataXrange.map(xContext));
    }

    brushg
      .selectAll(".extent")
      .attr("y", -6)
      .attr("height", height_context + 8);

    const brushHandle = brushg.selectAll(".handle");

    brushHandle.style("width", "3px");

    let label = vis.select(".title");

    if (label.empty()) {
      label = vis
        .append("text")
        .attr("class", "y axis title")
        .attr("x", -(height / 2))
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle");
    }
    label.text(yLabel);
  }, [data, yLabel, loading]);

  return (
    <div className="brushed-TS">
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
          freq={freq}
          color={color}
          loading={loading}
        />
        <g ref={contextRef} />
      </svg>
    </div>
  );
};

export default BrushedBarChart;
