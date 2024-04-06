/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit'
import { RootState } from './store' // Assuming RootState is the type of the entire Redux state
import { getReportData } from 'src/services/apis/apis'
import { ReportData } from '../types'
import { toast } from 'react-toastify'

interface ReportState {
  startDate: string
  endDate: string
  gridID: string
  reportTitle: string
  reportTemplate: string
  reportData: ReportData | null
  isLoading: boolean
  error: string | null
}

const initialState: ReportState = {
  startDate: '',
  endDate: '',
  gridID: '',
  reportTitle: '',
  reportTemplate: '',
  reportData: null,
  isLoading: false,
  error: null,
}

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload
    },
    setGridID: (state, action: PayloadAction<string>) => {
      state.gridID = action.payload
    },
    setReportTitle: (state, action: PayloadAction<string>) => {
      state.reportTitle = action.payload
    },
    setReportTemplate: (state, action: PayloadAction<string>) => {
      state.reportTemplate = action.payload
    },
    getReportDataStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    getReportDataSuccess: (state, action: PayloadAction<ReportData>) => {
      state.reportData = action.payload
      state.isLoading = false
    },
    getReportDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearForm: (state) => {
      state.startDate = ''
      state.endDate = ''
      state.gridID = ''
      state.reportTitle = ''
      state.reportTemplate = ''
      state.reportData = null
      toast.success('Form cleared successfully.')
    },
  },
})

export const getReportDataAsync =
  () => async (dispatch: Dispatch, getState: () => RootState) => {
    const { startDate, endDate, gridID, reportTitle } = getState().report

    if (!startDate || !endDate || !gridID || !reportTitle) {
      toast.error('One or more data items are empty.')
      return Promise.reject('One or more data items are empty.')
    }

    dispatch(getReportDataStart())

    const data = {
      start_time: startDate,
      end_time: endDate,
      grid_id: gridID,
    }

    try {
      const reportData = await getReportData(data)
      dispatch(getReportDataSuccess(reportData))

      // Clear the states here when the response is a success
      dispatch(setStartDate(''))
      dispatch(setEndDate(''))
      dispatch(setGridID(''))

      return {
        success: true,
      }
    } catch (error) {
      if (error instanceof Error) {
        dispatch(getReportDataFailure(error.message))
        toast.error(`Error: ${error.message}`)
      } else {
        dispatch(getReportDataFailure('An unknown error occurred.'))
        toast.error('An unknown error occurred.')
      }
      return {
        success: false,
      }
    }
  }

export const {
  setStartDate,
  setEndDate,
  setGridID,
  setReportTitle,
  setReportTemplate,
  getReportDataStart,
  getReportDataSuccess,
  getReportDataFailure,
  clearForm,
} = reportSlice.actions

export default reportSlice.reducer
