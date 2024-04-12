/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState, useMemo } from 'react'
import ChartJsImage from 'chartjs-to-image'
import { Image } from '@react-pdf/renderer'
import { store } from '@services/redux/store'
import { setLoading } from 'src/services/redux/ChartSlice'

interface BarChartProps {
  chartData: any
  width?: number
  height?: number
  graphTitle?: string
  xAxisTitle?: string
  yAxisTitle?: string
  setChartImageUrl?: any
}

export const BarChart: FC<BarChartProps> = ({
  chartData,
  width = 800,
  height = 400,
  graphTitle = '',
  xAxisTitle = '',
  yAxisTitle = '',
}) => {
  const [chartImageUrl, setChartImageUrl] = useState('')

  const chartConfig = useMemo(
    () => ({
      type: 'bar',
      data: {
        ...chartData,
        datasets: chartData.datasets.map((dataset: any) => ({
          ...dataset,
          backgroundColor: 'rgba(0, 0, 255, 0.4)',
        })),
      },
      options: {
        title: {
          display: true,
          text: graphTitle,
          fontSize: 20,
          fontColor: '#000000',
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: xAxisTitle,
                fontColor: 'black',
              },
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                fontColor: 'black',
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: yAxisTitle,
                fontColor: 'black',
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }),
    [chartData, graphTitle, xAxisTitle, yAxisTitle],
  )

  useEffect(() => {
    const generateChart = async () => {
      store.dispatch(setLoading(true))
      const myChart = new ChartJsImage()
      myChart.setConfig(chartConfig)

      // set chart width and height
      myChart.setWidth(width)
      myChart.setHeight(height)

      const url = await myChart.toDataUrl()
      setChartImageUrl(url)
      store.dispatch(setLoading(false))
    }

    generateChart()
  }, [chartConfig, width, height])

  return chartImageUrl && <Image src={chartImageUrl} />
}

export const LineChart: FC<BarChartProps> = ({
  chartData,
  width = 800,
  height = 300,
  graphTitle = '',
  xAxisTitle = '',
  yAxisTitle = '',
}) => {
  const [chartImageUrl, setChartImageUrl] = useState('')

  const chartConfig = useMemo(
    () => ({
      type: 'line',
      data: {
        ...chartData,
        datasets: chartData.datasets.map((dataset: any) => ({
          ...dataset,
          backgroundColor: 'rgba(0, 0, 255, 0.4)',
        })),
      },
      options: {
        title: {
          display: true,
          text: graphTitle,
          fontSize: 20,
          fontColor: '#000000',
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: xAxisTitle,
                fontColor: 'black',
              },
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                fontColor: 'black',
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: yAxisTitle,
                fontColor: 'black',
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }),
    [chartData, graphTitle, xAxisTitle, yAxisTitle],
  )

  useEffect(() => {
    const generateChart = async () => {
      store.dispatch(setLoading(true))
      const myChart = new ChartJsImage()
      myChart.setConfig(chartConfig)

      // set chart width and height
      myChart.setWidth(width)
      myChart.setHeight(height)

      const url = await myChart.toDataUrl()
      setChartImageUrl(url)
      store.dispatch(setLoading(false))
    }

    generateChart()
  }, [chartConfig, width, height])

  return chartImageUrl && <Image src={chartImageUrl} />
}
