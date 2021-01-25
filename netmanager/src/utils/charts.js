import palette from "assets/theme/palette";

export const createChartData = (label, data) => {
  return {
    labels: label,
    datasets: [
      {
        label: "Network Uptime",
        data: data,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };
};

export const createChartOptions = (xLabel, yLabel) => {
  return {
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
