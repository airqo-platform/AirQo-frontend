import palette from "assets/theme/palette";

export const dateToTimestamp = (datetimeStr) => {
  let datum = new Date(datetimeStr);
  return datum.getTime() / 1000;
};

export const ApexTimeSeriesData = (dates, data) => {
  let result = [];
  // dates.map((date, index) => {
  //   result.push([dateToTimestamp(date), data[index]]);
  // });
  dates.map((date, index) => {
    result.push({ x: date, y: data[index] });
  });
  return result;
};

export const createChartData = (label, data, dataLabel) => {
  return {
    labels: label,
    datasets: [
      {
        label: dataLabel || "value",
        data: data,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };
};

export const createChartOptions = (xLabel, yLabel, options) => {
  return {
    annotation:
      options && options.threshold
        ? {
            annotations: [
              {
                type: "line",
                mode: "horizontal",
                scaleID: "y-axis-0",
                value: options.threshold,
                borderColor: palette.text.secondary,
                borderWidth: 2,
                label: {
                  enabled: true,
                  content: "Threshold",
                  //backgroundColor: palette.white,
                  titleFontColor: palette.text.primary,
                  bodyFontColor: palette.text.primary,
                  position: "right",
                },
              },
            ],
          }
        : {},
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: "index",
      intersect: false,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.white,
      titleFontColor: palette.text.primary,
      bodyFontColor: palette.text.secondary,
      footerFontColor: palette.text.secondary,
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 35,
          //maxBarThickness: 10,
          barPercentage: 1,
          //categoryPercentage: 0.5,
          ticks: {
            fontColor: palette.text.secondary,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: xLabel,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider,
          },
          scaleLabel: {
            display: true,
            labelString: yLabel,
          },
        },
      ],
    },
  };
};

export const createBarChartData = (inputArr, key) => {
  let sum = 0;
  let total = 0;
  const label = [];
  const data = [];

  inputArr.map((val) => {
    sum += parseFloat(val[key]);
    total += 1;

    if (total === 1) {
      label.push("last 24 hours");
      data.push(sum.toFixed(2));
    } else if (total === 7) {
      label.push("last 7 days");
      data.push((sum / total).toFixed(2));
    } else if (total === 14) {
      label.push("last 14 days");
      data.push((sum / total).toFixed(2));
    } else if (total === 28) {
      label.push("last 28 days");
      data.push((sum / total).toFixed(2));
    }
  });
  return { label, data };
};

export const createChartJsData = (data, key) => {
  const labels = new Set();
  const sites = {};
  const formatted_data = [];
  const colors = [
    "#7F7F7F",
    "#E377C2",
    "#17BECF",
    "#BCBD22",
    "#3f51b5",
    "rgba(75,192,192,1)",
  ];

  data.map((datum) => {
    const site = (datum.sites && datum.sites[0]) || {};
    const siteName = `${
      site.name || site.description || site.generated_name
    } (${site.generated_name})`;
    labels.add(datum._id.time);
    if (!sites[siteName]) sites[siteName] = [];
    sites[siteName].push(datum[key]);
  });
  Object.keys(sites).map((site_key) => {
    const color = colors.pop();
    formatted_data.push({
      data: sites[site_key],
      label: site_key,
      borderColor: color,
      backgroundColor: color,
      fill: false,
    });
  });

  return {
    labels: Array.from(labels),
    datasets: formatted_data,
  };
};
