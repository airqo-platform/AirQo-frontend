/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET_GRIDS_DATA, GET_REPORT_DATA, SHARE_REPORT } from '../urls/urls'
import axios from 'axios'

const ACCESS_TOKEN = import.meta.env.VITE_API_ACCESS_TOKEN
const AUTHORIZATION_TOKEN = import.meta.env.VITE_API_AUTHORIZATION_TOKEN

const apiCall = async (url: string, method: string, data?: any) => {
  try {
    const response = await axios({
      method,
      url: `${url}?token=${ACCESS_TOKEN}`,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error occurred while making API call: ${error}`)
    throw error
  }
}

export const getGridsData = async () => apiCall(GET_GRIDS_DATA, 'get')

export const getReportData = async (data: any) =>
  apiCall(GET_REPORT_DATA, 'post', data)

export const shareReportApi = async (data: any) => {
  try {
    const response = await axios({
      method: 'post',
      url: SHARE_REPORT,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: AUTHORIZATION_TOKEN,
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error occurred while sharing report: ${error}`)
    throw error
  }
}
