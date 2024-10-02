/* eslint-disable jsx-a11y/alt-text */
'use client';

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import React, { useMemo } from 'react';

import { Chart } from '../graphs';

import TemplateLogo from '@/public/images/templateLogo.png';

// TypeScript Interfaces
interface Period {
  startTime: string;
  endTime: string;
}

interface Sites {
  'grid name': string[];
}

interface SiteMonthlyMeanPM {
  site_name: string;
  month: number;
  pm2_5_raw_value: number;
}

interface DailyMeanPM {
  date: string;
  pm2_5_raw_value: number;
}

interface DiurnalPM {
  hour: number;
  pm2_5_raw_value: number;
}

interface MonthlyPM {
  pm2_5_raw_value: number;
}

interface Data {
  period: Period;
  sites: Sites;
  site_monthly_mean_pm: SiteMonthlyMeanPM[];
  daily_mean_pm: DailyMeanPM[];
  diurnal: DiurnalPM[];
  monthly_pm: MonthlyPM[];
}

interface Template1Props {
  data: Data;
}

// Table Row Interface
interface TableRow {
  healthConcern: string;
  pm25: string;
  precautions: string;
  bgColor: string;
}

// Header Component
const Header: React.FC = () => (
  <View style={styles.header} fixed>
    <Image src={TemplateLogo.src} style={styles.logo} />
  </View>
);

// Table Component
const Table: React.FC<{ rows: TableRow[] }> = ({ rows }) => (
  <View style={styles.table}>
    {/* Table Header */}
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>Health Concern</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>PM2.5 (µg/m³)</Text>
      </View>
      <View style={styles.tableCol}>
        <Text style={styles.tableCell}>Precautions</Text>
      </View>
    </View>
    {/* Table Rows */}
    {rows.map((row, index) => (
      <View key={index} style={[styles.tableRow, { backgroundColor: row.bgColor }]}>
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
);

// Chart Component Wrapper
const ChartComponent: React.FC<{
  chartData: any;
  graphTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  caption: string;
  chartType: 'bar' | 'line';
}> = ({ chartData, graphTitle, xAxisTitle, yAxisTitle, caption, chartType }) => (
  <View style={styles.chartContainer}>
    <Chart
      chartData={chartData}
      graphTitle={graphTitle}
      xAxisTitle={xAxisTitle}
      yAxisTitle={yAxisTitle}
      chartType={chartType}
    />
    <Text style={styles.figureCaption}>{caption}</Text>
  </View>
);

// Section Title Component
const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.subTitle}>{title}</Text>
);

// Helper Function to Get Month Name
const getMonthName = (monthNumber: number) => {
  return format(new Date(2024, monthNumber - 1), 'MMMM');
};

// Main Template Component
const Template1: React.FC<Template1Props> = ({ data }) => {
  // Memoized Date Formatting
  const startDate = useMemo(
    () => format(new Date(data.period.startTime), 'MMM d, yyyy'),
    [data.period.startTime],
  );
  const endDate = useMemo(
    () => format(new Date(data.period.endTime), 'MMM d, yyyy'),
    [data.period.endTime],
  );

  // Define Table Data
  const tableData1: TableRow[] = useMemo(
    () => [
      {
        healthConcern: 'Good',
        pm25: '0 - 12',
        precautions:
          'None: Air quality is satisfactory; and air pollution poses little or no risk.',
        bgColor: '#00e400',
      },
      {
        healthConcern: 'Moderate',
        pm25: '12.1 - 35.4',
        precautions:
          'Unusually sensitive people should consider reducing prolonged or heavy exertion.',
        bgColor: '#ff0',
      },
      {
        healthConcern: 'Unhealthy for Sensitive Groups',
        pm25: '35.5 - 55.4',
        precautions: 'Sensitive groups should reduce prolonged or heavy exertion.',
        bgColor: '#f90',
      },
      {
        healthConcern: 'Unhealthy',
        pm25: '55.5 - 150.4',
        precautions:
          'Everyone should reduce prolonged or heavy exertion, take more breaks during outdoor activities.',
        bgColor: '#f00',
      },
      {
        healthConcern: 'Very Unhealthy',
        pm25: '150.5 - 250.4',
        precautions:
          'Everyone should avoid prolonged or heavy exertion, move activities indoors or reschedule.',
        bgColor: '#90f',
      },
      {
        healthConcern: 'Hazardous',
        pm25: '250.5 - 500.4',
        precautions: 'Everyone should avoid all physical activities outdoors.',
        bgColor: '#600',
      },
    ],
    [],
  );

  // Chart Data Preparation
  const chartData1 = useMemo(
    () => ({
      labels: data.site_monthly_mean_pm.map(
        (site) => `${site.site_name} (${format(new Date(2024, site.month - 1), 'MMM')})`,
      ),
      datasets: [
        {
          label: 'PM2.5 Raw Values',
          data: data.site_monthly_mean_pm.map((item) => item.pm2_5_raw_value),
        },
      ],
    }),
    [data.site_monthly_mean_pm],
  );

  const chartData2 = useMemo(
    () => ({
      labels: data.daily_mean_pm.map((item) => format(new Date(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Daily Mean PM2.5',
          data: data.daily_mean_pm.map((item) => item.pm2_5_raw_value),
        },
      ],
    }),
    [data.daily_mean_pm],
  );

  const chartData3 = useMemo(
    () => ({
      labels: data.diurnal.map((item) => `${item.hour}:00`),
      datasets: [
        {
          label: 'Diurnal PM2.5',
          data: data.diurnal.map((item) => item.pm2_5_raw_value),
        },
      ],
    }),
    [data.diurnal],
  );

  // Top and Bottom Locations
  const top5Locations = useMemo(
    () =>
      [...data.site_monthly_mean_pm]
        .sort((a, b) => b.pm2_5_raw_value - a.pm2_5_raw_value)
        .slice(0, 5),
    [data.site_monthly_mean_pm],
  );

  const bottom3Locations = useMemo(
    () =>
      [...data.site_monthly_mean_pm]
        .sort((a, b) => a.pm2_5_raw_value - b.pm2_5_raw_value)
        .slice(0, 3),
    [data.site_monthly_mean_pm],
  );

  // Highest and Lowest PM2.5 Hours
  const highestPM25Hour = useMemo(
    () =>
      data.diurnal.reduce(
        (max, item) => (item.pm2_5_raw_value > max.pm2_5_raw_value ? item : max),
        data.diurnal[0],
      ),
    [data.diurnal],
  );

  const lowestPM25Hour = useMemo(
    () =>
      data.diurnal.reduce(
        (min, item) => (item.pm2_5_raw_value < min.pm2_5_raw_value ? item : min),
        data.diurnal[0],
      ),
    [data.diurnal],
  );

  return (
    <Document
      title="Air Quality Report"
      author="AirQo"
      subject="Air Quality"
      language="en"
      pdfVersion="1.5"
    >
      <Page size="A4" style={styles.page}>
        <Header />

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Air Quality Report from {startDate} to {endDate}
            {'\n'} for {data.sites['grid name'][0]}
          </Text>
        </View>

        {/* Executive Summary */}
        <SectionTitle title="Executive Summary" />
        <Text style={styles.text}>
          This report summarizes the temporal air quality profiles observed by the AirQo monitors
          installed at {data.sites['grid name'][0]} between {startDate} and {endDate}. The AirQo
          monitor measures particulate matter (PM2.5) concentration, one of the primary air
          pollutants. PM2.5 are fine inhalable particles with diameters generally 2.5 micrometers
          and smaller. The data from the site indicates that the air quality at this location during
          the monitored period mainly alternated between moderate and unhealthy.
        </Text>

        {/* Introduction */}
        <SectionTitle title="Introduction" />
        <Text style={styles.text}>
          Air quality is a vital aspect of human health, well-being, and environmental
          sustainability. Prolonged exposure to air pollution can cause various adverse effects,
          such as respiratory infections, cardiovascular diseases, lung cancer, and premature death.
          Other associated effects due to short-term exposure are asthma attacks and chronic
          bronchitis.
          {'\n\n'}
          Among the various pollutants monitored, one key metric of interest is PM2.5. PM2.5 refers
          to particulate matter with a diameter of 2.5 micrometers or smaller. These microscopic
          particles, often generated from various sources such as vehicle emissions, industrial
          processes, rubbish and biomass burning, construction activities, mining activities, dust
          from unpaved roads, etc., can pose significant health risks when inhaled. Due to their
          small size, PM2.5 particles can penetrate deep into the lungs, potentially causing
          respiratory and cardiovascular issues. The sources of PM2.5 pollution in Kampala may
          include traffic emissions, biomass burning, industrial processes, dust from unpaved roads
          and construction activities.
        </Text>
        <Text style={styles.text}>
          This report encapsulates the findings from meticulous data analysis from {startDate} and{' '}
          {endDate}. The focus of this investigation revolved around the values of PM2.5, a critical
          parameter in evaluating air quality. It aims to provide an insightful overview of this
          locale’s air quality conditions and neighborhood.
        </Text>

        {/* Data Presentation */}
        <SectionTitle title="Data Presentation" />
        <Text style={styles.text}>
          Data for this report is presented and visualized using the US-EPA Air Quality Index (AQI)
          to communicate the health risks associated with PM2.5 exposure. The data visualization is
          based on a simplified approach that adopts the raw concentration categorization with the
          corresponding AQI color codes.
        </Text>

        {/* Air Quality Index Table */}
        <View>
          <Table rows={tableData1} />
          <Text style={styles.figureCaption}>Table 1: Air Quality Index (US-EPA)</Text>
        </View>

        {/* Site Monthly Mean PM2.5 Bar Chart */}
        <ChartComponent
          chartData={chartData1}
          graphTitle={`Site Monthly Mean PM2.5 for ${data.sites['grid name'][0]}`}
          xAxisTitle="Locations"
          yAxisTitle="PM2.5 Raw Values"
          caption={`Figure 1: Monthly mean PM2.5 for different sites in ${data.sites['grid name'][0]}`}
          chartType="bar"
        />

        {/* Top 5 Locations Text */}
        <Text style={styles.text}>
          The locations with the highest PM2.5 raw values in the dataset for the specified period
          include{' '}
          {top5Locations.map((location, index) => (
            <React.Fragment key={location.site_name}>
              {location.site_name}, recording a PM2.5 value of {location.pm2_5_raw_value} µg/m³ in{' '}
              {getMonthName(location.month)}
              {index < top5Locations.length - 1 ? ', followed by ' : '.'}
            </React.Fragment>
          ))}
        </Text>

        {/* Bottom 3 Locations Text */}
        <Text style={styles.text}>
          In contrast to the locations with the highest PM2.5 values, there are several locations
          that stand out for their notably low PM2.5 values. As shown in Figure 1, the locations
          with the lowest recorded PM2.5 values include{' '}
          {bottom3Locations.map((location, index) => (
            <React.Fragment key={location.site_name}>
              {location.site_name}, with a value of {location.pm2_5_raw_value} µg/m³ in{' '}
              {getMonthName(location.month)}
              {index < bottom3Locations.length - 1 ? ', closely followed by ' : '.'}
            </React.Fragment>
          ))}
        </Text>

        {/* Daily Mean PM2.5 Bar Chart */}
        <ChartComponent
          chartData={chartData2}
          graphTitle={`Daily Mean PM2.5 for ${data.sites['grid name'][0]}`}
          xAxisTitle="Date"
          yAxisTitle="PM2.5 Raw Values"
          caption={`Figure 2: Daily mean PM2.5 for ${data.sites['grid name'][0]}`}
          chartType="bar"
        />

        {/* Diurnal PM2.5 Line Chart */}
        <SectionTitle title="Diurnal" />
        <ChartComponent
          chartData={chartData3}
          graphTitle={`Diurnal PM2.5 for ${data.sites['grid name'][0]}`}
          xAxisTitle="Hour"
          yAxisTitle="PM2.5 Raw Values"
          caption={`Figure 3: Diurnal PM2.5 for ${data.sites['grid name'][0]} (local time)`}
          chartType="line"
        />

        {/* Diurnal PM2.5 Analysis */}
        <Text style={styles.text}>
          The hourly variation of PM2.5 concentrations reveals insights into air quality patterns
          for {data.sites['grid name'][0]}. The highest PM2.5 value occurs at {highestPM25Hour.hour}
          :00, with a value of {highestPM25Hour.pm2_5_raw_value} µg/m³, while the lowest is at{' '}
          {lowestPM25Hour.hour}:00, with a value of {lowestPM25Hour.pm2_5_raw_value} µg/m³. Peak
          concentrations are observed at night and in the morning, indicating potential contributing
          sources or activities. Daytime hours generally show lower PM2.5 levels, suggesting
          improved air quality during the day.
          {'\n\n'}
          It{"'"}s important to note that the PM2.5 values in this dataset are higher than the WHO
          recommended standard, indicating a need for interventions to improve air quality.
        </Text>

        {/* Conclusion Section */}
        <SectionTitle title="Conclusion" />
        <Text style={styles.text}>
          The analysis of the data reveals that air quality varies significantly over time, with
          periods of both moderate and unhealthy conditions. It’s observed that these fluctuations
          may be influenced by various factors, including seasonal changes. For instance, the
          washout effect during the rainy season could potentially contribute to these variations.
          Specifically, for the period from {startDate} to {endDate}, the PM2.5 raw values ranged
          from {data.monthly_pm[0]?.pm2_5_raw_value} µg/m³ to {data.monthly_pm[1]?.pm2_5_raw_value}{' '}
          µg/m³ respectively. This pattern underscores the importance of continuous monitoring and
          the implementation of effective interventions to maintain air quality within safe limits.
          Ensuring good air quality is crucial for the well-being of both residents and visitors.
          Therefore, it’s imperative to adopt long-term strategies and measures that can effectively
          mitigate the impact of factors leading to poor air quality.
          {'\n\n'}
          In conclusion, continuous monitoring, timely intervention, and effective policies are key
          to maintaining good air quality and safeguarding public health.
        </Text>

        {/* Protective Measures */}
        <Text style={styles.text}>
          To protect yourself from air pollution, we suggest the following measures:
        </Text>
        <View>
          {[
            'Check the air quality in your area at different hours of the day.',
            'If the air quality is high outdoors, avoid outdoor activities to reduce exposure.',
            'Limit the use of fans that might stir up dust and other particles.',
            'If possible, use an air purifier to remove particulate pollutants from the air in your office.',
            'Avoid burning rubbish, firewood, etc.',
            'Wear a pollution mask if you can’t avoid outdoor activities; pollution masks help filter out most particulate matter from the air you breathe.',
          ].map((item, index) => (
            <View style={styles.listItem} key={index}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.itemContent}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

// Stylesheet
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 60,
    objectFit: 'contain',
  },
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  text: {
    fontSize: 11,
    textAlign: 'justify',
    fontFamily: 'Times-Roman',
    lineHeight: 1.4,
    marginVertical: 6,
  },
  figureCaption: {
    textAlign: 'center',
    fontSize: 9,
    marginVertical: 8,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bulletPoint: {
    width: 10,
    marginLeft: 25,
    marginRight: 5,
    textAlign: 'center',
  },
  itemContent: {
    flex: 1,
    fontSize: 11,
    textAlign: 'left',
    fontFamily: 'Times-Roman',
    lineHeight: 1.4,
  },
  chartContainer: {
    marginVertical: 10,
  },
});

export default Template1;
