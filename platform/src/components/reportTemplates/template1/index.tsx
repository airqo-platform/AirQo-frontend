/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useMemo } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { BarChart, LineChart } from "../graphs";
import { format } from "date-fns";

interface Template1Props {
  data: any;
}

const Header: React.FC = () => {
  return (
    <View style={styles.header} fixed>
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/templateLogo.png`}
        style={{
          width: "auto",
          height: 60,
        }}
      />
    </View>
  );
};

export default function Template1({ data }: Template1Props) {
  const startDate = useMemo(
    () =>
      new Date(data?.period.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [data?.period.startTime]
  );

  const endDate = useMemo(
    () =>
      new Date(data?.period.endTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [data?.period.endTime]
  );

  const tableData1 = useMemo(
    () => [
      {
        healthConcern: "Good",
        pm25: "0 - 12",
        precautions:
          "None: Air quality is satisfactory; and air pollution poses little or no risk.",
        bgColor: "#00e400",
      },
      {
        healthConcern: "Moderate",
        pm25: "12.1 - 35.4",
        precautions:
          "Unusually sensitive people should consider reducing prolonged or heavy exertion.",
        bgColor: "#ff0",
      },
      {
        healthConcern: "Unhealthy for Sensitive Groups",
        pm25: "35.5 - 55.4",
        precautions:
          "Sensitive groups should reduce prolonged or heavy exertion.",
        bgColor: "#f90",
      },
      {
        healthConcern: "Unhealthy",
        pm25: "55.5 - 150.4",
        precautions:
          "Everyone should reduce prolonged or heavy exertion, take more breaks during outdoor activities.",
        bgColor: "#f00",
      },
      {
        healthConcern: "Very Unhealthy",
        pm25: "150.5 - 250.4",
        precautions:
          "Everyone should avoid prolonged or heavy exertion, move activities indoors or reschedule.",
        bgColor: "#90f",
      },
      {
        healthConcern: "Hazardous",
        pm25: "250.5 - 500.4",
        precautions: "Everyone should avoid all physical activities outdoors.",
        bgColor: "#600",
      },
    ],
    []
  );

  const chartData1 = {
    labels: data.site_monthly_mean_pm.map((site_name: any) => {
      const monthName = format(new Date(2024, site_name.month - 1), "MMM");
      return `${site_name.site_name} (${monthName})`;
    }),
    datasets: [
      {
        label: "PM2.5 Raw Values",
        data: data.site_monthly_mean_pm.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value
        ),
      },
    ],
  };

  const chartData2 = {
    labels: data.daily_mean_pm.map((item: { date: string }) =>
      new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Daily Mean PM2.5",
        data: data.daily_mean_pm.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value
        ),
      },
    ],
  };

  const chartData3 = {
    labels: data.diurnal.map((item: { hour: number }) => item.hour),
    datasets: [
      {
        label: "Diurnal PM2.5",
        data: data.diurnal.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value
        ),
      },
    ],
  };

  const top5Locations = [...data.site_monthly_mean_pm]
    .sort((a: any, b: any) => b.pm2_5_raw_value - a.pm2_5_raw_value)
    .slice(0, 5);

  const bottom3Locations = [...data.site_monthly_mean_pm]
    .sort((a: any, b: any) => a.pm2_5_raw_value - b.pm2_5_raw_value)
    .slice(0, 3);

  const highestPM25Hour = data.diurnal.reduce(
    (max: any, item: any) =>
      item.pm2_5_raw_value > max.pm2_5_raw_value ? item : max,
    data.diurnal[0]
  );
  const lowestPM25Hour = data.diurnal.reduce(
    (min: any, item: any) =>
      item.pm2_5_raw_value < min.pm2_5_raw_value ? item : min,
    data.diurnal[0]
  );

  const getMonthName = (monthNumber: number) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthNumber - 1];
  };

  return (
    <Document
      title="Air Quality Report"
      author="AirQo"
      subject="Air Quality"
      language="en"
      pdfVersion="1.5"
    >
      {/* page 1 */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>
            Air Quality Report from {startDate} to {endDate}
            {"\n"} for {data.sites["grid name"][0]}
          </Text>
        </View>
        <Text style={styles.subTitle}>Executive Summary</Text>
        <Text style={styles.text}>
          This report summarizes the temporal air quality profiles observed by
          the AirQo monitors installed at {data.sites["grid name"][0]} between{" "}
          {startDate} and {endDate}. The AirQo monitor measures particulate
          matter(PM2.5) concentration, one of the primary air pollutants. PM2.5
          are fine inhalable particles with diameters generally 2.5 micrometers
          and smaller. The data from the site indicates that the air quality at
          this location during the monitored period mainly alternated between
          moderate and unhealthy.
        </Text>
        <Text style={styles.subTitle}>Introduction</Text>
        <Text style={styles.text}>
          Air quality is a vital aspect of human health, well-being, and
          environmental sustainability. Prolonged exposure to air pollution can
          cause various adverse effects, such as respiratory infections,
          cardiovascular diseases, lung cancer, and premature death. Other
          associated effects due to short-term exposure are asthma attacks and
          chronic bronchitis.
          {"\n"} {"\n"}
          Among the various pollutants monitored, one key metric of interest is
          PM2.5. PM2.5 refers to particulate matter with a diameter of 2.5
          micrometers or smaller. These microscopic particles, often generated
          from various sources such as vehicle emissions, industrial processes,
          rubbish and biomass burning, construction activities, mining
          activities, dust from unpaved roads, etc, can pose significant health
          risks when inhaled. Due to their small size, PM2.5 particles can
          penetrate deep into the lungs, potentially causing respiratory and
          cardiovascular issues. The sources of PM2.5 pollution in Kampala may
          include traffic emissions, biomass burning, industrial processes, dust
          from unpaved roads and construction activities.
        </Text>
        <Text style={styles.text}>
          This report encapsulates the findings from meticulous data analysis
          from {startDate} and {endDate}. The focus of this investigation
          revolved around the values of PM2.5, a critical parameter in
          evaluating air quality. It aims to provide an insightful overview of
          this locale&rsquo;s air quality conditions and neighborhood.
        </Text>
        <View></View>
        <Text style={styles.subTitle}>Data Presentation</Text>
        <Text style={styles.text}>
          Data for this report is presented and visualized using the US-EPA Air
          Quality Index (AQI) to communicate the health risks associated with
          PM2.5 exposure. The data visualization is based on a simplified
          approach that adopts the raw concentration categorization with the
          corresponding AQI color codes.
        </Text>
        <View>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Health Concern</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>PM2.5 (µgm⁻³)</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Precautions</Text>
              </View>
            </View>
            {/* Table Rows */}
            {/* Repeat below View for each row */}
            {tableData1.map((row, index) => (
              <View
                key={index}
                style={{
                  ...styles.tableRow,
                  backgroundColor: row.bgColor,
                }}
              >
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.healthConcern}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.pm25}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.precautions}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text
            style={{
              ...styles.figureCaption,
              marginBottom: 20,
            }}
          >
            Table 1: Air Quality Index (US-EPA)
          </Text>
        </View>
        <View>
          <BarChart
            chartData={chartData1}
            graphTitle={`Site Monthly Mean PM2.5 for ${data.sites["grid name"][0]}`}
            xAxisTitle="Locations"
            yAxisTitle="PM2.5 Raw Values"
          />

          <Text
            style={{
              ...styles.figureCaption,
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            Figure 1: Figure showing the monthly mean PM2.5 for different sites
            in {data.sites["grid name"][0]}
          </Text>
        </View>
        <Text style={styles.text}>
          The locations with the highest PM2.5 raw values in the dataset for the
          specified period include{" "}
          {top5Locations.slice(0, 5).map((location, index) => (
            <React.Fragment key={location.site_name}>
              {location.site_name}, recording a PM2.5 value of{" "}
              {location.pm2_5_raw_value} µg/m³ in {getMonthName(location.month)}
              {index < top5Locations.length - 1 ? ", followed by " : "."}
            </React.Fragment>
          ))}
        </Text>

        <Text style={styles.text}>
          In contrast to the locations with the highest PM2.5 values, there are
          several locations that stand out for their notably low PM2.5 values.
          As shown in Figure 1, the locations with the lowest recorded PM2.5
          values include{" "}
          {bottom3Locations.slice(0, 3).map((location, index) => (
            <React.Fragment key={location.site_name}>
              {location.site_name}, with a value of {location.pm2_5_raw_value}{" "}
              µg/m³ in {getMonthName(location.month)}
              {index < bottom3Locations.length - 1
                ? ", closely followed by "
                : "."}
            </React.Fragment>
          ))}
        </Text>
        <View>
          <BarChart
            chartData={chartData2}
            graphTitle={`Daily Mean PM2.5 for ${data.sites["grid name"][0]}`}
            xAxisTitle="Date"
            yAxisTitle="PM2.5 Raw Values"
          />
          <Text style={styles.figureCaption}>
            Figure 2: Figure showing the daily mean PM2.5 for{" "}
            {data.sites["grid name"][0]}
          </Text>
        </View>
        <View>
          <Text style={styles.subTitle}>Diurnal</Text>
          <LineChart
            chartData={chartData3}
            graphTitle={`Diurnal PM2.5 for ${data.sites["grid name"][0]}`}
            xAxisTitle="Hour"
            yAxisTitle="PM2.5 Raw Values"
          />
          <Text style={styles.figureCaption}>
            Figure 3: Diurnal PM2.5 for {data.sites["grid name"][0]}. (The time
            was in GMT)
          </Text>
        </View>
        <Text style={styles.text}>
          The hourly variation of PM2.5 concentrations reveals insights into air
          quality patterns for {data.sites["grid name"][0]}. The highest PM2.5
          value occurs at {highestPM25Hour.hour}:00, with a value of{" "}
          {highestPM25Hour.pm2_5_raw_value} µg/m³, while the lowest is at{" "}
          {lowestPM25Hour.hour}:00, with a value of{" "}
          {lowestPM25Hour.pm2_5_raw_value} µg/m³. Peak concentrations are
          observed at night and in the morning, indicating potential
          contributing sources or activities. Daytime hours generally show lower
          PM2.5 levels, suggesting improved air quality during the day.
          {"\n"}
          {"\n"}
          It{"'"}s important to note that the PM2.5 values in this dataset are
          higher than the WHO recommended standard, indicating a need for
          interventions to improve air quality.
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
        <View>
          <Text style={styles.subTitle}>Conclusion</Text>{" "}
          <Text style={styles.text}>
            {" "}
            The analysis of the data reveals that air quality varies
            significantly over time, with periods of both moderate and unhealthy
            conditions. It’s observed that these fluctuations may be influenced
            by various factors, including seasonal changes. For instance, the
            washout effect during the rainy season could potentially contribute
            to these variations. Specifically, for the period from {
              startDate
            }{" "}
            to {endDate}, the PM2.5 raw values ranged from{" "}
            {data.monthly_pm[0].pm2_5_raw_value} µg/m³ to{" "}
            {data.monthly_pm[1].pm2_5_raw_value} µg/m³ respectively.{"\n"}This
            pattern underscores the importance of continuous monitoring and the
            implementation of effective interventions to maintain air quality
            within safe limits. Ensuring good air quality is crucial for the
            well-being of both residents and visitors. Therefore, it’s
            imperative to adopt long-term strategies and measures that can
            effectively mitigate the impact of factors leading to poor air
            quality.{"\n"}
            {"\n"}In conclusion, continuous monitoring, timely intervention, and
            effective policies are key to maintaining good air quality and
            safeguarding public health. {"\n"}
            {"\n"}{" "}
          </Text>
          <View>
            <Text style={styles.text}>
              To protect yourself from air pollution, we suggest the following
              measures:
            </Text>
            <View style={{ ...styles.listItem2 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>
                Check the air quality in your area at different hours of the
                day.
              </Text>
            </View>
            <View style={{ ...styles.listItem2 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>
                If the air quality is high outdoors, avoid outdoor activities to
                reduce exposure.
              </Text>
            </View>
            <View style={{ ...styles.listItem2 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>
                Limit the use of fans that might stir up dust and other
                particles.
              </Text>
            </View>
            <View style={{ ...styles.listItem2 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>
                If possible, use an air purifier to remove particulate
                pollutants from the air in your office.
              </Text>
            </View>
            <View style={{ ...styles.listItem2 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>
                Avoid burning rubbish, firewood, etc.
              </Text>
            </View>
            <View style={{ ...styles.listItem2 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>
                Wear a pollution mask if you can{"'"}t avoid outdoor activities;
                pollution masks help filter out most particulate matter from the
                air you breathe.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  text: {
    fontSize: 12,
    textAlign: "justify",
    fontFamily: "Times-Roman",
    fontWeight: "normal",
    lineHeight: 1.5,
    margin: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 12,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
  },
  image: {
    width: 50,
    height: 50,
  },
  figureCaption: {
    textAlign: "center",
    fontSize: 10,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    padding: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "33%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    alignItems: "center",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    padding: 5,
    fontSize: 10,
  },
  listItem2: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontSize: 12,
    textAlign: "left",
    fontFamily: "Times-Roman",
    fontWeight: "normal",
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
    marginLeft: 25,
    marginRight: 5,
    textAlign: "center",
  },
  itemContent: {
    flex: 1,
    fontSize: 12,
    textAlign: "left",
    fontFamily: "Times-Roman",
    fontWeight: "normal",
    lineHeight: 1.5,
  },
});
