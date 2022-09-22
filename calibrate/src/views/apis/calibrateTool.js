import axios from "axios";
import {
  CALIBRATE_TOOL_URL,
  TRAIN_CALIBRATE_TOOL_URL,
} from "../../configs/urls";

axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;

export const calibrateDataApi = async (data) => {
  return await axios
    .request({
      url: CALIBRATE_TOOL_URL,
      method: "POST",
      data: data,
      headers: { "Content-Type": "multipart/form-data" },
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
      responseType: "blob", //important
    })
    .then((response) => response.data)
    .catch((err) => console.log(err));
};
