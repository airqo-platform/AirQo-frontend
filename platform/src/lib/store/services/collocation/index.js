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
        url: '',
        method: 'POST',
        body: addMonitorInput,
      }),
      onQueryFulfilled: (data, { dispatch }) => {
        dispatch(addCollocationData(data));
      },
    }),
    getDeviceStatusSummary: builder.query({
      query: () =>
        'https://an-314-collocation-endpoints-device-monitoring-pr-w7kzhvlewq-ew.a.run.app/api/v1/monitor/devices/collocation/summary',
    }),
  }),
});

export const {
  useCollocateDevicesMutation,
  useGetDeviceStatusSummaryQuery,
  util: { getRunningQueriesThunk },
} = collocateApi;

// export endpoints for use in SSR
export const { collocateDevices, getDeviceStatusSummary } = collocateApi.endpoints;
