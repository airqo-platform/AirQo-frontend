import moment from 'moment';

export const timeSeriesChartOptions = (extraOptions) => ({
  chart: {
    zoom: {
      autoScaleYaxis: true
    }
  },
  dataLabels: {
    enabled: false
  },
  markers: {
    size: 0,
    style: 'hollow'
  },
  xaxis: {
    type: 'datetime',
    tickAmount: 4,
    labels: {
      datetimeUTC: false,
      formatter: function (value, timestamp, opts) {
        return moment(new Date(timestamp)).format('DD MMM');
      },
      showDuplicates: false
    }
  },
  tooltip: {
    x: {
      formatter: function (val) {
        return moment(new Date(val)).format('DD MMM yyyy HH:mm:ss');
      }
    }
  },
  stroke: {
    width: 1
  },
  ...extraOptions
});

export const createPieChartOptions = (colors, labels) => {
  return {
    chart: {
      type: 'pie'
    },
    colors: colors || ['#BCBD22', '#17BECF'],
    labels: labels,
    responsive: [
      {
        options: {
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };
};

export const uuidV4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};
