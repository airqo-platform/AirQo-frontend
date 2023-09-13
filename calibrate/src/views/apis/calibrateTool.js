import axios from "axios";
import {
  CALIBRATE_TOOL_URL,
  TRAIN_CALIBRATE_TOOL_URL,
} from "../../configs/urls";

const BASE_AUTH_TOKEN = process.env.REACT_APP_AUTH_TOKEN;

export const calibrateDataApi = async (data) => {
  return await axios
    .request({
      url: CALIBRATE_TOOL_URL,
      method: "POST",
      data: data,
      headers: { "Content-Type": "multipart/form-data" },
      params: {
        token: BASE_AUTH_TOKEN,
      },
      responseType: "blob", //important
    })

    .then((response) => response.data)
    .catch((err) => console.log(err));
};

export const trainAndCalibrateDataApi = async (data) => {
  return await axios
    .request({
      url: TRAIN_CALIBRATE_TOOL_URL,
      method: "POST",
      data: data,
      headers: { "Content-Type": "multipart/form-data" },
      params: {
        token: BASE_AUTH_TOKEN,
      },
      responseType: "blob", //important
    })
    .then((response) => response.data)
    .catch((err) => console.log(err));
};
