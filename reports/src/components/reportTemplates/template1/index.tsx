/* eslint-disable jsx-a11y/alt-text */
'use client';

import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import React, { FC, useMemo } from 'react';

import Table from '../components/Table';
import { BarChartComponent, LineChartComponent } from '../graphs';
import styles from '../styles';

import TemplateLogo from '@/public/images/templateLogo.png';

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

interface SiteInfo {
  'grid name': string[];
}

interface MonthlyPM {
  pm2_5_raw_value: number;
}

interface Data {
  period: {
    startTime: string;
    endTime: string;
  };
  site_monthly_mean_pm: SiteMonthlyMeanPM[];
  daily_mean_pm: DailyMeanPM[];
  diurnal: DiurnalPM[];
  sites: SiteInfo;
  monthly_pm: MonthlyPM[];
}

interface Template1Props {
  data: Data;
}

// Static table data
const AQITableData = [
  {
    healthConcern: 'Good',
    pm25: '0 - 12',
    precautions: 'None: Air quality is satisfactory; and air pollution poses little or no risk.',
    bgColor: '#00e400',
  },
  {
    healthConcern: 'Moderate',
    pm25: '12.1 - 35.4',
    precautions: 'Unusually sensitive people should consider reducing prolonged or heavy exertion.',
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
];

// Utility function to get month name
const getMonthName = (monthNumber: number): string => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[monthNumber - 1];
};

// Header Component
const Header: FC = () => (
  <View style={styles.header} fixed>
    <Image src={TemplateLogo.src} style={styles.logo} />
  </View>
);

// Section Component
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.subTitle}>{title}</Text>
    {children}
  </View>
);

// ListItem Component
interface ListItemProps {
  text: string;
}

const ListItem: FC<ListItemProps> = ({ text }) => (
  <View style={styles.listItem}>
    <Text style={styles.bulletPoint}>•</Text>
    <Text style={styles.itemContent}>{text}</Text>
  </View>
);

const Template1: FC<Template1Props> = ({ data }) => {
  // Format dates
  const startDate = useMemo(() => {
    const date = new Date(data.period.startTime);
    return format(date, 'MMM d, yyyy');
  }, [data.period.startTime]);

  const endDate = useMemo(() => {
    const date = new Date(data.period.endTime);
    return format(date, 'MMM d, yyyy');
  }, [data.period.endTime]);

  // Prepare chart data
  const chartData1 = useMemo(() => {
    return {
      labels: data.site_monthly_mean_pm.map((site) => {
        const monthName = format(new Date(2024, site.month - 1), 'MMM');
        return `${site.site_name} (${monthName})`;
      }),
      datasets: [
        {
          label: 'PM2.5 Raw Values',
          data: data.site_monthly_mean_pm.map((item) => item.pm2_5_raw_value),
        },
      ],
    };
  }, [data.site_monthly_mean_pm]);

  const chartData2 = useMemo(() => {
    return {
      labels: data.daily_mean_pm.map((item) => format(new Date(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Daily Mean PM2.5',
          data: data.daily_mean_pm.map((item) => item.pm2_5_raw_value),
        },
      ],
    };
  }, [data.daily_mean_pm]);

  const chartData3 = useMemo(() => {
    return {
      labels: data.diurnal.map((item) => `${item.hour}:00`),
      datasets: [
        {
          label: 'Diurnal PM2.5',
          data: data.diurnal.map((item) => item.pm2_5_raw_value),
        },
      ],
    };
  }, [data.diurnal]);

  // Top 5 and Bottom 3 Locations
  const top5Locations = useMemo(() => {
    return [...data.site_monthly_mean_pm]
      .sort((a, b) => b.pm2_5_raw_value - a.pm2_5_raw_value)
      .slice(0, 5);
  }, [data.site_monthly_mean_pm]);

  const bottom3Locations = useMemo(() => {
    return [...data.site_monthly_mean_pm]
      .sort((a, b) => a.pm2_5_raw_value - b.pm2_5_raw_value)
      .slice(0, 3);
  }, [data.site_monthly_mean_pm]);

  // Highest and Lowest PM2.5 Hours
  const highestPM25Hour = useMemo(() => {
    return data.diurnal.reduce(
      (max, item) => (item.pm2_5_raw_value > max.pm2_5_raw_value ? item : max),
      data.diurnal[0],
    );
  }, [data.diurnal]);

  const lowestPM25Hour = useMemo(() => {
    return data.diurnal.reduce(
      (min, item) => (item.pm2_5_raw_value < min.pm2_5_raw_value ? item : min),
      data.diurnal[0],
    );
  }, [data.diurnal]);

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
        <View style={styles.centeredView}>
          <Text style={styles.title}>
            Air Quality Report from {startDate} to {endDate}
            {'\n'} for {data.sites['grid name'][0]}
          </Text>
        </View>

        {/* Executive Summary */}
        <Section title="Executive Summary">
          <Text style={styles.text}>
            This report summarizes the temporal air quality profiles observed by the AirQo monitors
            installed at {data.sites['grid name'][0]} between {startDate} and {endDate}. The AirQo
            monitor measures particulate matter (PM2.5) concentration, one of the primary air
            pollutants. PM2.5 are fine inhalable particles with diameters generally 2.5 micrometers
            and smaller. The data from the site indicates that the air quality at this location
            during the monitored period mainly alternated between moderate and unhealthy.
          </Text>
        </Section>

        {/* Introduction */}
        <Section title="Introduction">
          <Text style={styles.text}>
            Air quality is a vital aspect of human health, well-being, and environmental
            sustainability. Prolonged exposure to air pollution can cause various adverse effects,
            such as respiratory infections, cardiovascular diseases, lung cancer, and premature
            death. Other associated effects due to short-term exposure are asthma attacks and
            chronic bronchitis.
            {'\n'} {'\n'}
            Among the various pollutants monitored, one key metric of interest is PM2.5. PM2.5
            refers to particulate matter with a diameter of 2.5 micrometers or smaller. These
            microscopic particles, often generated from various sources such as vehicle emissions,
            industrial processes, rubbish and biomass burning, construction activities, mining
            activities, dust from unpaved roads, etc., can pose significant health risks when
            inhaled. Due to their small size, PM2.5 particles can penetrate deep into the lungs,
            potentially causing respiratory and cardiovascular issues. The sources of PM2.5
            pollution in Kampala may include traffic emissions, biomass burning, industrial
            processes, dust from unpaved roads, and construction activities.
          </Text>
          <Text style={styles.text}>
            This report encapsulates the findings from meticulous data analysis from {startDate} to{' '}
            {endDate}. The focus of this investigation revolved around the values of PM2.5, a
            critical parameter in evaluating air quality. It aims to provide an insightful overview
            of this locale&apos;s air quality conditions and neighborhood.
          </Text>
        </Section>

        {/* Data Presentation */}
        <Section title="Data Presentation">
          <Text style={styles.text}>
            Data for this report is presented and visualized using the US-EPA Air Quality Index
            (AQI) to communicate the health risks associated with PM2.5 exposure. The data
            visualization is based on a simplified approach that adopts the raw concentration
            categorization with the corresponding AQI color codes.
          </Text>

          {/* AQI Table */}
          <Table headers={['Health Concern', 'PM2.5 (µg/m³)', 'Precautions']} rows={AQITableData} />
          <Text style={styles.figureCaption}>Table 1: Air Quality Index (US-EPA)</Text>

          {/* Bar Chart 1 */}
          <BarChartComponent
            chartData={chartData1}
            graphTitle={`Site Monthly Mean PM2.5 for ${data.sites['grid name'][0]}`}
            xAxisTitle="Locations"
            yAxisTitle="PM2.5 Raw Values"
          />
          <Text style={styles.figureCaption}>
            Figure 1: Monthly mean PM2.5 for different sites in {data.sites['grid name'][0]}
          </Text>

          {/* Top 5 Locations */}
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

          {/* Bottom 3 Locations */}
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

          {/* Bar Chart 2 */}
          <BarChartComponent
            chartData={chartData2}
            graphTitle={`Daily Mean PM2.5 for ${data.sites['grid name'][0]}`}
            xAxisTitle="Date"
            yAxisTitle="PM2.5 Raw Values"
          />
          <Text style={styles.figureCaption}>
            Figure 2: Daily mean PM2.5 for {data.sites['grid name'][0]}
          </Text>

          {/* Diurnal Section */}
          <Section title="Diurnal">
            <LineChartComponent
              chartData={chartData3}
              graphTitle={`Diurnal PM2.5 for ${data.sites['grid name'][0]}`}
              xAxisTitle="Hour"
              yAxisTitle="PM2.5 Raw Values"
            />
            <Text style={styles.figureCaption}>
              Figure 3: Diurnal PM2.5 for {data.sites['grid name'][0]} (local time)
            </Text>
            <Text style={styles.text}>
              The hourly variation of PM2.5 concentrations reveals insights into air quality
              patterns for {data.sites['grid name'][0]}. The highest PM2.5 value occurs at{' '}
              {highestPM25Hour.hour}:00, with a value of {highestPM25Hour.pm2_5_raw_value} µg/m³,
              while the lowest is at {lowestPM25Hour.hour}:00, with a value of{' '}
              {lowestPM25Hour.pm2_5_raw_value} µg/m³. Peak concentrations are observed at night and
              in the morning, indicating potential contributing sources or activities. Daytime hours
              generally show lower PM2.5 levels, suggesting improved air quality during the day.
              {'\n'}
              {'\n'}
              It&apos;s important to note that the PM2.5 values in this dataset are higher than the
              WHO recommended standard, indicating a need for interventions to improve air quality.
            </Text>
          </Section>

          {/* Page Number */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />

          {/* Conclusion */}
          <Section title="Conclusion">
            <Text style={styles.text}>
              The analysis of the data reveals that air quality varies significantly over time, with
              periods of both moderate and unhealthy conditions. It&apos;s observed that these
              fluctuations may be influenced by various factors, including seasonal changes. For
              instance, the washout effect during the rainy season could potentially contribute to
              these variations. Specifically, for the period from {startDate} to {endDate}, the
              PM2.5 raw values ranged from {data.monthly_pm[0].pm2_5_raw_value} µg/m³ to{' '}
              {data.monthly_pm[1].pm2_5_raw_value} µg/m³ respectively.
              {'\n'}
              This pattern underscores the importance of continuous monitoring and the
              implementation of effective interventions to maintain air quality within safe limits.
              Ensuring good air quality is crucial for the well-being of both residents and
              visitors. Therefore, it&apos;s imperative to adopt long-term strategies and measures
              that can effectively mitigate the impact of factors leading to poor air quality.
              {'\n'}
              {'\n'}
              In conclusion, continuous monitoring, timely intervention, and effective policies are
              key to maintaining good air quality and safeguarding public health.
              {'\n'}
              {'\n'}
            </Text>
            <Text style={styles.text}>
              To protect yourself from air pollution, we suggest the following measures:
            </Text>
            <View style={styles.list}>
              <ListItem text="Check the air quality in your area at different hours of the day." />
              <ListItem text="If the air quality is high outdoors, avoid outdoor activities to reduce exposure." />
              <ListItem text="Limit the use of fans that might stir up dust and other particles." />
              <ListItem text="If possible, use an air purifier to remove particulate pollutants from the air in your office." />
              <ListItem text="Avoid burning rubbish, firewood, etc." />
              <ListItem text="Wear a pollution mask if you can't avoid outdoor activities; pollution masks help filter out most particulate matter from the air you breathe." />
            </View>
          </Section>
        </Section>
      </Page>
    </Document>
  );
};

export default Template1;
