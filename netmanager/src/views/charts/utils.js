export const timeSeriesChartOptions = {
  chart: {
    id: "area-datetime",
    type: "area",
    height: 350,
    zoom: {
      autoScaleYaxis: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
    style: "hollow",
  },
  xaxis: {
    type: "datetime",
  },
  tooltip: {
    x: {
      format: "dd MMM yyyy",
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100],
    },
  },
};

export const createPieChartOptions = (colors, labels) => {
  return {
    chart: {
      type: "pie",
    },
    colors: colors || ["#BCBD22", "#17BECF"],
    labels: labels,
    responsive: [
      {
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
};
