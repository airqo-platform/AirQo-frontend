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
import { BarChart } from 'src/components/charts'
import AirqoLogo from '/images/templateLogo.png'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Times-Roman',
    fontWeight: 'normal',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  section: {
    margin: 10,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
})

interface NemaProps {
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

const Nema: React.FC<NemaProps> = ({ data }) => {
  if (!data) return null

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

  return (
    <Document
      title="Air Quality Report"
      author="AirQo"
      subject="Air Quality"
      language="en"
      pdfVersion="1.5"
    >
      {/* page 2 */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={styles.section}>
          <View>
            <BarChart
              chartData={chartData1}
              graphTitle="Graph Title"
              xAxisTitle="X Axis Title"
              yAxisTitle="Y Axis Title"
            />
            <Text
              style={{
                ...styles.figureCaption,
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              Figure 1: Figure showing the top 5 highest mean PM2.5 in Uganda
            </Text>
          </View>
          <Text style={styles.text}>
            The top five locations with the highest PM2.5 calibrated values in
            the dataset for the specified period include Nansana west ward in
            Wakiso, recording a PM2.5 value of 76.02 µg/m³. Following closely is
            Rushoroza Hill in Kabale with a value of 71.98 µg/m³, followed by
            Kasubi in Rubaga at 70.44 µg/m³. Kawempe comes in fourth with a
            PM2.5 value of 67.95 µg/m³, while Mpanga in Fort Portal rounds out
            the top five with a recorded value of 66.06 µg/m³. Despite the
            variation in readings, there was a noticeable reduction in the
            highest value compared to January.
          </Text>
          <Text style={styles.text}>
            Conversely, the locations with the lowest mean PM2.5 that have less
            than 20 µg/m³ values in February as shown in figure 2:
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default Nema
