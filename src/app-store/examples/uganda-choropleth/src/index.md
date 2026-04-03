---
title: Uganda Hourly Air Quality
theme: dashboard
toc: false
---

```js
import * as Plot from "@observablehq/plot";
import { radio, table } from "@observablehq/inputs";
import { html } from "htl";
import * as d3 from "npm:d3";
```

# Uganda Hourly Air Quality Trend Analysis

```js
const pollutant = view(
  radio(
    new Map([
      ["PM2.5", "pm2_5"],
      ["PM10", "pm10"]
    ]),
    { value: "pm2_5", label: "Pollutant" }
  )
);

const COLOR_BINS = [
  { max: 12, color: "#FFE5CC", label: "0–12" },
  { max: 25, color: "#FFC38A", label: "12–25" },
  { max: 40, color: "#FF9B47", label: "25–40" },
  { max: 60, color: "#FF7A1A", label: "40–60" },
  { max: 100, color: "#E56400", label: "60–100" },
  { max: Infinity, color: "#B34700", label: "100+" }
];

const pickColor = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "#E2E8F0";
  return (COLOR_BINS.find((entry) => value <= entry.max) || COLOR_BINS[COLOR_BINS.length - 1]).color;
};

const normalizeDistrict = (value) => (value || "").trim().toLowerCase();

const getFeatureDistrict = (feature) => {
  const props = feature.properties || {};
  return props.district || props.name || props.admin_2 || props.admin || "";
};

const movingAverage = (values, windowSize) => {
  if (windowSize <= 1) return values;
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((sum, item) => sum + item.value, 0) / slice.length;
    out.push({ time: values[i].time, value: avg });
  }
  return out;
};
```

## Data

```js
const gridResponse = await FileAttachment("data/uganda-grid.geo.json").json();
const measurementsResponse = await FileAttachment("data/measurements.json").json();

const gridShape = gridResponse;
const features = gridShape?.type === "FeatureCollection"
  ? gridShape.features
  : gridShape?.type === "Feature"
    ? [gridShape]
    : [];

const measurements = measurementsResponse?.measurements || [];

const districtBuckets = new Map();
const kampalaSiteBuckets = new Map();
for (const item of measurements) {
  const district = normalizeDistrict(item.siteDetails?.district);
  if (!district) continue;
  if (!districtBuckets.has(district)) districtBuckets.set(district, []);
  districtBuckets.get(district).push(item);

  if (district === "kampala" || district.includes("kampala")) {
    let siteName = item.siteDetails?.search_name || item.siteDetails?.name || "Unknown Site";
    siteName = siteName.split(",")[0].trim();
    if (!kampalaSiteBuckets.has(siteName)) kampalaSiteBuckets.set(siteName, []);
    kampalaSiteBuckets.get(siteName).push(item);
  }
}

const districtValues = {};
const kampalaSiteValues = {};
let trendSeries = [];
const districts = Array.from(districtBuckets.keys());
const trendDistrict = districts[0];
for (const [district, items] of districtBuckets.entries()) {
  const sorted = items
    .filter((entry) => entry.time)
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  if (!sorted.length) continue;

  const values = sorted
    .map((entry) => entry[pollutant]?.value)
    .filter((value) => typeof value === "number");

  if (values.length) {
    districtValues[district] = values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  if (district === trendDistrict) {
    trendSeries = sorted
      .map((entry) => ({
        time: new Date(entry.time),
        value: entry[pollutant]?.value
      }))
      .filter((entry) => typeof entry.value === "number");
  }
}

for (const [site, items] of kampalaSiteBuckets.entries()) {
  const values = items
    .map((entry) => entry[pollutant]?.value)
    .filter((value) => typeof value === "number");
  if (values.length) {
    kampalaSiteValues[site] = values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}

const valuesArray = Object.values(districtValues).filter((value) => Number.isFinite(value));
const avgValue = valuesArray.length ? valuesArray.reduce((sum, value) => sum + value, 0) / valuesArray.length : null;
const maxValue = valuesArray.length ? Math.max(...valuesArray) : null;
const pollutantLabel = pollutant === "pm2_5" ? "PM2.5" : "PM10";
```

```js
html`<div class="grid grid-cols-4">
  <div class="card">
    <div class="card-title">Districts</div>
    <div class="metric">${districts.length || "—"}</div>
  </div>
  <div class="card">
    <div class="card-title">Average ${pollutantLabel}</div>
    <div class="metric">${avgValue ? avgValue.toFixed(1) : "—"}</div>
  </div>
  <div class="card">
    <div class="card-title">Max ${pollutantLabel}</div>
    <div class="metric">${maxValue ? maxValue.toFixed(1) : "—"}</div>
  </div>
  <div class="card">
    <div class="card-title">Trend District</div>
    <div class="metric">${trendDistrict ? trendDistrict.charAt(0).toUpperCase() + trendDistrict.slice(1) : "—"}</div>
  </div>
</div>`;
```

<div class="grid grid-cols-2" style="margin-top: 2rem;">
  <div class="card">
    <h2>Uganda District Map</h2>

```js
const mapWidth = typeof width === "number" ? width : 900;
const mapHeight = Math.round(mapWidth * 0.6);

display(Plot.plot({
  width: mapWidth,
  height: mapHeight,
  projection: { type: "mercator", domain: gridShape },
  color: { type: "identity" },
  marks: [
    Plot.geo(features, {
      fill: (d) => pickColor(districtValues[normalizeDistrict(getFeatureDistrict(d))]),
      stroke: "white",
      strokeWidth: 0.5
    })
  ]
}))
```

```js
html`<div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:#64748b;">
  ${COLOR_BINS.map((bin) => html`
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${bin.color};"></span>
      ${bin.label}
    </div>
  `)}
</div>`
```

  </div>
  <div class="card">
    <h2>Kampala Site Readings</h2>

```js
const kampalaSitesCount = Object.keys(kampalaSiteValues).length;
if (kampalaSitesCount === 0) {
  display(html`<div class="subtitle">No Kampala sites available.</div>`);
} else {
  const chartWidth = Math.max(800, typeof width !== "undefined" ? width : 800);
  const chartHeight = chartWidth;
  const innerRadius = chartWidth / 18;
  const outerRadius = chartWidth / 2.2;

  const data = Object.entries(kampalaSiteValues)
    .map(([district, value]) => ({ // Map site name to district variable natively to avoid renaming x/y references below
      district: district.length > 22 ? district.substring(0, 20) + "..." : district,
      value: value
    }))
    .sort((a, b) => b.value - a.value);

  const svg = d3.create("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("viewBox", [-chartWidth / 2, -chartHeight / 2, chartWidth, chartHeight])
      .attr("style", "max-width: 100%; height: auto; font-family: ui-sans-serif, system-ui, sans-serif;");

  const x = d3.scaleBand()
      .domain(data.map(d => d.district))
      .range([0, 2 * Math.PI])
      .align(0);

  const y = d3.scaleRadial()
      .domain([0, d3.max(data, d => d.value)])
      .range([innerRadius, outerRadius]);

  const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(d => y(d.value))
      .startAngle(d => x(d.district))
      .endAngle(d => x(d.district) + x.bandwidth())
      .padAngle(0.02)
      .padRadius(innerRadius);

  svg.append("g")
    .selectAll("path")
    .data(data)
    .join("path")
      .attr("fill", d => pickColor(d.value))
      .attr("stroke", "white")
      .attr("stroke-width", 0.75)
      .attr("d", arc);

  svg.append("g")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("transform", (d) => {
      const a = x(d.district) + x.bandwidth() / 2;
      const textAngle = a - Math.PI / 2;
      const rotate = (textAngle * 180) / Math.PI;
      const flip = textAngle < -Math.PI / 2 || textAngle > Math.PI / 2 ? 180 : 0;
      return `rotate(${rotate}) translate(${y(d.value) + 14}, 0) rotate(${flip})`;
    })
    .attr("text-anchor", (d) => {
      const a = x(d.district) + x.bandwidth() / 2;
      const textAngle = a - Math.PI / 2;
      return textAngle < -Math.PI / 2 || textAngle > Math.PI / 2 ? "end" : "start";
    })
    .attr("dominant-baseline", "middle")
    .attr("font-size", "16px")
    .attr("fill", "currentColor")
    .attr("font-weight", "600")
    .text(d => d.district)
    .each(function (d) {
      d3.select(this)
        .append("tspan")
        .attr("dx", "0.5em")
        .attr("fill", "#8a8a8a")
        .attr("font-size", "20px")
        .attr("font-weight", "normal")
        .text(d.value.toFixed(1));
    });

  display(svg.node());
}
```

  </div>
</div>

<div class="card">
  <h2>Hourly Moving Average (24-hour)</h2>

```js
const sortedSeries = trendSeries
  .filter((d) => typeof d.value === "number")
  .sort((a, b) => a.time - b.time);

const movingAverageSeries = movingAverage(sortedSeries, 24);

display(Plot.plot({
  width: typeof width === "number" ? width : 900,
  height: 300,
  y: { grid: true },
  x: { grid: true },
  marks: [
    Plot.line(sortedSeries, { x: "time", y: "value", stroke: "#94A3B8" }),
    Plot.line(movingAverageSeries, { x: "time", y: "value", stroke: "#FF7A1A", strokeWidth: 2 })
  ]
}))
```
</div>
