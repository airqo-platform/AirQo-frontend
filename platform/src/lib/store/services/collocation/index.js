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
      queryFn: async (newInput) => {
        try {
          const response = await fetch('/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newInput),
          });

          if (!response.ok) {
            const text = await response.text();
            const errorRegex = /<pre>(.*?)<\/pre>/gs;
            const match = errorRegex.exec(text);
            const errorMessage = match ? match[1] : 'Unknown error';
            throw new Error(errorMessage);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.log(error.message);
        }
      },
      onQueryFulfilled: (data, { dispatch }) => {
        dispatch(addCollocationData(data));
      },
    }),
  }),
});

export const {
  useCollocateDevicesMutation,
  util: { getRunningQueriesThunk },
} = collocateApi;

// export endpoints for use in SSR
export const { collocateDevices } = collocateApi.endpoints;
