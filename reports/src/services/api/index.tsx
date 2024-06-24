import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getReportData = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/analytics/grid/report`,
      data,
      {
        params: {
          token: process.env.NEXT_PUBLIC_API_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGridData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/devices/grids`, {
      params: {
        token: process.env.NEXT_PUBLIC_API_TOKEN,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
