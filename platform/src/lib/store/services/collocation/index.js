import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';
import { NEXT_PUBLIC_AUTHORISATION } from '../../../envConstants';
import { COLLOCATION } from '@/core/urls/deviceMonitoring';
import { addCollocationData } from './collocationDataSlice';

export const collocateApi = createApi({
  reducerPath: 'collocateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: COLLOCATION,
    prepareHeaders: (headers) => {
      const token = `JWT ${NEXT_PUBLIC_AUTHORISATION}`;
      headers.set('Authorization', token);

      return headers;
    },
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    collocateDevices: builder.mutation({
      query: (addMonitorInput) => ({
        url: '/schedule',
        method: 'POST',
        body: addMonitorInput,
      }),
    }),
    getDeviceStatusSummary: builder.query({
      query: () => '/summary',
    }),
    getCollocationResults: builder.mutation({
      query: ({ devices, startDate, endDate }) => {
        return {
          url: '/data',
          method: 'POST',
          body: { devices: [devices], startDate, endDate },
        };
      },
    }),
    getDataCompletenessResults: builder.mutation({
      query: (addDataCompletenessInput) => {
        return {
          url: '/data-completeness',
          method: 'POST',
          body: addDataCompletenessInput,
        };
      },
    }),
    getIntraSensorCorrelation: builder.mutation({
      query: (addIntraSensorInput) => {
        return {
          url: '/intra',
          method: 'POST',
          body: addIntraSensorInput,
        };
      },
    }),
  }),
});

export const {
  useCollocateDevicesMutation,
  useGetDeviceStatusSummaryQuery,
  useGetCollocationResultsMutation,
  useGetDataCompletenessResultsMutation,
  useGetIntraSensorCorrelationMutation,
  util: { getRunningQueriesThunk },
} = collocateApi;

// export endpoints for use in SSR
export const {
  collocateDevices,
  getDeviceStatusSummary,
  getCollocationResults,
  getDataCompletenessResults,
  getIntraSensorCorrelation,
} = collocateApi.endpoints;
