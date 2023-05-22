import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { NEXT_PUBLIC_API_TOKEN } from '../../../envConstants';
import { COLLOCATION } from '@/core/urls/deviceMonitoring';

export const collocateApi = createApi({
  reducerPath: 'collocateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: COLLOCATION,
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    collocateDevices: builder.mutation({
      query: (addMonitorInput) => ({
        url: `?token=${NEXT_PUBLIC_API_TOKEN}`,
        method: 'POST',
        body: addMonitorInput,
      }),
    }),
    getDeviceStatusSummary: builder.query({
      query: () => `/summary?token=${NEXT_PUBLIC_API_TOKEN}`,
    }),
    getCollocationResults: builder.query({
      query: ({ devices, batchId }) => {
        return {
          url: `/data?token=${NEXT_PUBLIC_API_TOKEN}`,
          params: { devices, batchId },
        };
      },
    }),
    getDataCompletenessResults: builder.query({
      query: ({ devices, batchId }) => {
        return {
          url: `/data-completeness?token=${NEXT_PUBLIC_API_TOKEN}`,
          params: { devices, batchId },
        };
      },
    }),
    getIntraSensorCorrelation: builder.query({
      query: (addIntraSensorInput) => {
        return {
          url: `/intra?token=${NEXT_PUBLIC_API_TOKEN}`,
          params: {
            devices: addIntraSensorInput.devices,
            batchId: addIntraSensorInput.batchId,
          },
        };
      },
    }),
    getCollocationStatistics: builder.query({
      query: (addCollocationStatisticsInput) => {
        return {
          url: `/statistics?token=${NEXT_PUBLIC_API_TOKEN}`,
          params: {
            devices: addCollocationStatisticsInput.devices,
            batchId: addCollocationStatisticsInput.batchId,
          },
        };
      },
    }),
  }),
});

export const {
  useCollocateDevicesMutation,
  useGetDeviceStatusSummaryQuery,
  useGetCollocationResultsQuery,
  useGetDataCompletenessResultsQuery,
  useGetIntraSensorCorrelationQuery,
  useGetCollocationStatisticsQuery,
  util: { getRunningQueriesThunk },
} = collocateApi;

// export endpoints for use in SSR
export const {
  collocateDevices,
  getDeviceStatusSummary,
  getCollocationResults,
  getDataCompletenessResults,
  getIntraSensorCorrelation,
  getCollocationStatistics,
} = collocateApi.endpoints;
