export const timeSeriesChartOptions = (extraOptions) => ({
  chart: {
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
      format: "dd MMM yyyy hh:mm:ss",
    },
  },
  ...extraOptions,
});

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

export const uuidV4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};
