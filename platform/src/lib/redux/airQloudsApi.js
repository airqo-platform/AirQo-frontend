import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AIRQLOUDS } from '@/core/urls/deviceRegistry';
import { HYDRATE } from 'next-redux-wrapper';

export const airqloudsApi = createApi({
  reducerPath: 'airqloudsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: AIRQLOUDS,
    prepareHeaders: (headers) => {
      const token = `JWT ${process.env.NEXT_PUBLIC_AUTHORISATION}`;
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
    getAllAirQlouds: builder.query({
      query: () => '',
    }),
  }),
});

export const {
  useGetAllAirQloudsQuery,
  util: { getRunningOperationPromises },
} = airqloudsApi;
