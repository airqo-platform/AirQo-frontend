import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DEVICES } from '@/core/urls/deviceRegistry';
import { HYDRATE } from 'next-redux-wrapper';
import { NEXT_PUBLIC_API_TOKEN } from '../../envConstants';

export const deviceRegistryApi = createApi({
  reducerPath: 'deviceRegistryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: DEVICES,
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    getAllDevices: builder.query({
      query: () => '',
    }),
    getCollocationDevices: builder.query({
      query: () => `/events/running?token=${NEXT_PUBLIC_API_TOKEN}&tenant=airqo`,
    }),
  }),
});

export const {
  useGetAllDevicesQuery,
  useGetCollocationDevicesQuery,
  util: { getRunningQueriesThunk },
} = deviceRegistryApi;

// export endpoints for use in SSR
export const { getAllDevices, getCollocationDevices } = deviceRegistryApi.endpoints;
