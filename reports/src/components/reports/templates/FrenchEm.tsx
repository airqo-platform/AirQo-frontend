/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { BarChart, LineChart } from 'src/components/charts'
import AirqoLogo from '/images/templateLogo.png'
import AQI from '/images/AQI.png'

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
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  text: {
    fontSize: 12,
    textAlign: 'justify',
    fontFamily: 'Times-Roman',
    fontWeight: 'normal',
    lineHeight: 1.5,
    margin: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    textAlign: 'center',
    fontSize: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
})

interface FrenchEmProps {
  data: any
}

const Header: React.FC = () => {
  return (
    <View style={styles.header} fixed>
      <Image
        src={AirqoLogo}
        style={{
          width: 'auto',
          height: 60,
        }}
      />
    </View>
  )
}

const FrenchEm: React.FC<FrenchEmProps> = ({ data }) => {
  if (!data) return null

  const startDate = new Date(
    data.airquality.period.startTime,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const endDate = new Date(data.airquality.period.endTime).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )

  const chartData1 = {
    labels: data.airquality.site_monthly_mean_pm.map(
      (site_name: any) => site_name.site_name,
    ),
    datasets: [
      {
        label: 'PM2.5 Raw Values',
        data: data.airquality.site_monthly_mean_pm.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value,
        ),
      },
    ],
  }

  const chartData2 = {
    labels: data.airquality.daily_mean_pm.map((item: { date: string }) =>
      new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    ),
    datasets: [
      {
        label: 'Daily Mean PM2.5',
        data: data.airquality.daily_mean_pm.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value,
        ),
      },
    ],
  }

  const chartData3 = {
    labels: data.airquality.diurnal.map((item: { hour: number }) => item.hour),
    datasets: [
      {
        label: 'Diurnal PM2.5',
        data: data.airquality.diurnal.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value,
        ),
      },
    ],
  }

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
        <View>
          <Text style={styles.title}>
            Air Quality Report from {startDate} to {endDate} for{' '}
            {data.airquality.sites['grid name']}
          </Text>
        </View>
        <Text style={styles.subTitle}>Executive Summary</Text>
        <Text style={styles.text}>
          This report summarises the temporal air quality profiles observed by
          the AirQo monitor installed at the French Embassy in Kampala between{' '}
          {startDate} and {endDate}. The AirQo monitor measures particulate
          matter(PM2.5) concentration, one of the primary air pollutants. PM2.5
          are fine inhalable particles with diameters generally 2.5 micrometres
          and smaller. The data from the site indicates that the air quality at
          this location during the monitored period mainly alternated between
          moderate and unhealthy. During the end of 2023, the air quality was
          largely moderate, and in January 2024, the air quality was largely
          unhealthy.
        </Text>
        <Text style={styles.subTitle}>Introduction</Text>
        <Text style={styles.text}>
          Air quality is a vital aspect of human health, well-being, and
          environmental sustainability. Prolonged exposure to air pollution can
          cause various adverse effects, such as respiratory infections,
          cardiovascular diseases, lung cancer, and premature death. Other
          associated effects due to short-term exposure are asthma attacks and
          chronic bronchitis.
          {'\n'} {'\n'}
          Among the various pollutants monitored, one key metric of interest is
          PM2.5. PM2.5 refers to particulate matter with a diameter of 2.5
          micrometres or smaller. These microscopic particles, often generated
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
          In steadfast adherence to our unwavering dedication to fostering a
          healthy and safe environment, AirQo, in partnership with the French
          Embassy in Kampala, has undertaken a comprehensive examination of the
          air quality in the vicinity of the French Embassy in Kampala, located
          on Lumumba Avenue in Nakasero.
          {'\n'} {'\n'}
          This report encapsulates the findings from meticulous data analysis
          from October 2023 to 31st January 2024. The focus of this
          investigation revolved around the values of PM2.5, a critical
          parameter in evaluating air quality. It aims to provide an insightful
          overview of this locale's air quality conditions and neighbourhood.
        </Text>
        <Text style={styles.subTitle}>Data Presentation</Text>
        <Text style={styles.text}>
          Data for this report is presented and visualised using the US-EPA Air
          Quality Index (AQI) to communicate the health risks associated with
          PM2.5 exposure. The data visualisation is based on a simplified
          approach that adopts the raw concentration categorisation with the
          corresponding AQI colour codes.
        </Text>
        <View>
          <Image
            src={AQI}
            style={{
              width: 'auto',
              height: 200,
              margin: 10,
            }}
          />
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
            graphTitle={`Site Monthly Mean PM2.5 for ${data.airquality.sites['grid name']}`}
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
            in
            {data.airquality.sites['grid name']}
          </Text>
        </View>
        <Text style={styles.text}>
          The top five locations with the highest PM2.5 calibrated values in the
          dataset for the specified period include Nansana west ward in Wakiso,
          recording a PM2.5 value of 76.02 µg/m³. Following closely is Rushoroza
          Hill in Kabale with a value of 71.98 µg/m³, followed by Kasubi in
          Rubaga at 70.44 µg/m³. Kawempe comes in fourth with a PM2.5 value of
          67.95 µg/m³, while Mpanga in Fort Portal rounds out the top five with
          a recorded value of 66.06 µg/m³. Despite the variation in readings,
          there was a noticeable reduction in the highest value compared to
          January.
        </Text>
        <Text style={styles.text}>
          Conversely, the locations with the lowest mean PM2.5 that have less
          than 20 µg/m³ values in February as shown in figure 2:
        </Text>
        <View>
          <BarChart
            chartData={chartData2}
            graphTitle={`Daily Mean PM2.5 for ${data.airquality.sites['grid name']}`}
            xAxisTitle="Date"
            yAxisTitle="PM2.5 Raw Values"
          />
          <Text style={styles.figureCaption}>
            Figure 2: Figure showing the daily mean PM2.5 for{' '}
            {data.airquality.sites['grid name']}
          </Text>
        </View>
        <Text style={styles.text}>
          Among the recorded PM2.5 calibrated values, a few sites exhibited
          particularly low levels, all measuring below 20 µg/m³. Notably, the
          site at Bahai in Kawempe, Kampala reported the lowest value at 10.75
          µg/m³, indicating a relatively clean air environment. Following
          closely, the site at Jinja Main Street in Jinja city registered a
          PM2.5 value of 19.87 µg/m³, slightly higher than the Bahai site but
          still well below the 20 threshold. Similarly, the site at Njeru also
          displayed a notably low PM2.5 level, recording at 18.80 µg/m³. This
          was an improvement from January levels where there was no location
          with values less than 20 µg/m³.
        </Text>
        <View>
          <Text style={styles.subTitle}>Diurnal</Text>
          <LineChart
            chartData={chartData3}
            graphTitle={`Diurnal PM2.5 for ${data.airquality.sites['grid name']}`}
            xAxisTitle="Hour"
            yAxisTitle="PM2.5 Raw Values"
          />
          <Text style={styles.figureCaption}>
            Figure 3: Diurnal PM2.5 for {data.airquality.sites['grid name']}.
            (The time was in GMT)
          </Text>
        </View>
        <Text style={styles.text}>
          The hourly variation of PM2.5 concentrations, revealing insights into
          air quality patterns. The highest PM2.5 value occurs at 21:00 (9:00
          PM), while the lowest is at 16:00 (4:00 PM). Peak concentrations are
          observed at night and in the morning, indicating potential
          contributing sources or activities. Daytime hours generally show lower
          PM2.5 levels, suggesting improved air quality during the day.
          {'\n'}
          {'\n'}
          The PM2.5 value in uganda is higher than the WHO recommended standard
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}

export default FrenchEm
