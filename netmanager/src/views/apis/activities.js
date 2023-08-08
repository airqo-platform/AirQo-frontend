import axios from "axios";
import { BASE_AUTH_TOKEN } from '../../utils/envVariables';
import { getUserDetails } from "../../redux/Join/actions";
import { 
  DEPLOY_DEVICE_URI,
  RECALL_DEVICE_URI,
  ADD_MAINTENANCE_LOGS_URI
 } from "../../config/urls/deviceRegistry";
import { 
  recallDeviceApi, 
  deployDeviceApi,
  addMaintenanceLogApi
} from "./deviceRegistry";

export const recallPostData = async (user, deviceName) => {
  try {
    const recallFormData = {
      userName: user.firstName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const response = await axios.post(recallDeviceApi(deviceName), recallFormData);
    console.log("Recall Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

export const maintainPostData = async (user, deviceName) => {
  try {
    const maintainFormData = {
      userName: user.firstName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const response = await axios.post(
      ADD_MAINTENANCE_LOGS_URI,
      maintainFormData,
      { params: { deviceName, token: BASE_AUTH_TOKEN }}
    );
    console.log("Maintenance Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

export const deployPostData = async (user, deviceName) => {
  try {
    const deployFormData = {
      userName: user.firstName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const response = await axios.post(deployDeviceApi(deviceName), deployFormData);
    console.log("Deploy Response:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// export const recallPostData = async (user) => {
//   try {

//     const formData = {
//       userName: user.firstName,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     };

//     const response = await axios.post(recallDeviceApi(parsedData.deviceName), formData); 
//     console.log("Response:", response.data);
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };

// export const maintainPostData = async (deviceName, user) => {
//   try {
//     const formData = {
//       userName: user.firstName,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     };

//     const response = await axios
//       .post(ADD_MAINTENANCE_LOGS_URI, formData, { params: { deviceName, token: BASE_AUTH_TOKEN }}); 
//     console.log("Response:", response.data);
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };

// export const deployPostData = async (user) => {
//   try {

//     const formData = {
//       userName: user.firstName,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     };


//     const response = await axios.post(deployDeviceApi(parsedData.deviceName), formData); 
//     console.log("Response:", response.data);
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };

