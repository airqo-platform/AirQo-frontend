import React, { useEffect, useState} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
} from "@material-ui/core";
import clsx from "clsx";
import { MoreHoriz } from "@material-ui/icons";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Bar } from "react-chartjs-2";
import domtoimage from "dom-to-image";
import JsPDF from "jspdf";
import palette from "theme/palette";
import axios from "axios";
import { DAILY_MEAN_AVERAGES_URI } from "config/urls/analytics";
import { roundToEndOfDay, roundToStartOfDay } from "utils/dateTime";
import { unzip, zip } from "underscore";
import moment from "moment";

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

const AveragesChart = ({ classes }) => {
  const rootContainerId = "widget-container";
  const iconButton = "exportIconButton";
  const filter = (node) => node.id !== iconButton;
  const endDate = moment(new Date()).toISOString();
  const startDate = moment(endDate).subtract(28, "days").toISOString();

  const [anchorEl, setAnchorEl] = useState(null);

  const [averages, setAverages] = useState({
    labels: [],
    average_values: [],
    background_colors: [],
  });

  let todaysDate = new Date();

  const dateValue = appendLeadingZeroes(
    todaysDate.getDate() +
      "/" +
      appendLeadingZeroes(todaysDate.getMonth() + 1) +
      "/" +
      todaysDate.getFullYear()
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const ITEM_HEIGHT = 48;
  const paperProps = {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 150,
    },
  };

  const print = async (chart) => {
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
      let html = "<html><head><title></title></head>";
      html += '<body style="width: 100%; padding: 0; margin: 0;"';
      html += ' onload="window.focus(); window.print(); window.close()">';
      html += `<img src="${dataUrl}" /></body></html>`;

      const printWindow = window.open("", "print");
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("oops, something went wrong!", err);
    }
  };

  const exportToImage = async (chart, format, exportFunc) => {
    try {
      const dataUrl = await exportFunc(chart, { filter });
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.download = `chart.${format}`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (err) {
      console.error("oops, something went wrong!", err);
    }
  };

  const exportToJpeg = (chart) =>
    exportToImage(chart, "jpeg", domtoimage.toJpeg);

  const exportToPng = (chart) => exportToImage(chart, "png", domtoimage.toPng);

  const exportToPdf = async (chart) => {
    const width = chart.offsetWidth;
    const height = chart.offsetHeight;
    try {
      const dataUrl = await domtoimage.toJpeg(chart, { filter });
      const doc = new JsPDF({
        orientation: "landscape",
        unit: "px",
        format: [width, height],
      });
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      doc.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      doc.save("chart");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("oops, something went wrong!", err);
    }
  };

  const options = [
    { key: "Print", action: print, text: "Print" },
    { key: "JPEG", action: exportToJpeg, text: "Save as JPEG" },
    { key: "PNG", action: exportToPng, text: "Save as PNG" },
    { key: "PDF", action: exportToPdf, text: "Save as PDF" },
  ];

  const handleExport = ({ action }) => () => {
    const chart = document.querySelector(`#${rootContainerId}`);
    handleClose();
    action(chart);
  };

  const locationsGraphData = {
    labels: averages.labels,
    datasets: [
      {
        label: "PM2.5(µg/m3)",
        data: averages.average_values,
        fill: false, // Don't fill area under the line
        borderColor: palette.primary.main, // Line color
        backgroundColor: averages.background_colors, //palette.primary.main,
      },
    ],
  };

  const options_main = {
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: 25,
          borderColor: palette.text.secondary,
          borderWidth: 2,
          label: {
            enabled: true,
            content: "WHO AQG",
            //backgroundColor: palette.white,
            titleFontColor: palette.text.primary,
            bodyFontColor: palette.text.primary,
            position: "right",
          },
        },
      ],
    },
    responsive: true,
    maintainAspectRatio: true,
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
      callbacks: {
        //title: (items, data) => data.labels[items[0].index],
        //afterTitle: (items, data) =>
        //return data['labels'][tooltipItem[0]['index']]
        //label: (item, data) => data.datasets[item.datasetIndex].data[item.index]
      },
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 12,
          maxBarThickness: 10,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          ticks: {
            fontColor: "black",
            callback: (value) => `${value.substr(0, 7)}...`,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Locations",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
            //suggestedMin:20
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
            labelString: "PM2.5(µg/m3)",
          },
        },
      ],
    },
  };

  useEffect(() => {
    axios
      .post(DAILY_MEAN_AVERAGES_URI, {
        startDate: roundToStartOfDay(startDate).toISOString(),
        endDate: roundToEndOfDay(endDate).toISOString(),
        pollutant: "pm2_5",
      })
      .then((response) => response.data)
      .then((responseData) => {
        const averagesData = responseData.data;
        const zippedArr = zip(
          averagesData.labels,
          averagesData.average_values,
          averagesData.background_colors
        );
        zippedArr.sort((a, b) => {
          const a0 = a[0].trim(),
            b0 = b[0].trim();
          if (a0 < b0) return -1;
          if (a0 > b0) return 1;
          return 0;
        });
        const [labels, average_values, background_colors] = unzip(zippedArr);
        setAverages({ labels, average_values, background_colors });
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <Grid item lg={6} md={6} sm={12} xl={6} xs={12}>
      <Card className={clsx(classes.chartCard)} id={rootContainerId}>
        <CardHeader
          title={`Mean Daily PM2.5 for Past 28 Days`}
          subheader={`from ${dateValue}`}
          action={
            <Grid>
              <IconButton
                size="small"
                color="primary"
                id={iconButton}
                onClick={handleClick}
                className={classes.chartSaveButton}
              >
                <MoreHoriz />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={paperProps}
              >
                {options.map((option) => (
                  <MenuItem key={option.key} onClick={handleExport(option)}>
                    {option.text}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
          }
        />
        <Divider />
        <CardContent>
          <div className={classes.chartContainer}>
            <Bar data={locationsGraphData} options={options_main} />
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default AveragesChart;
